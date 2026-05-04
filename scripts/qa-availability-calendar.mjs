#!/usr/bin/env node

const baseUrl = process.env.QA_BASE_URL || "https://directstay.app";
const minStay = Number(process.env.MIN_STAY || 5);
const start = process.env.QA_START || "2026-01-01";
const end = process.env.QA_END || "2027-01-10";
const today = process.env.QA_TODAY || new Date().toISOString().slice(0, 10);

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eachDay(startDate, endDate) {
  const out = [];
  for (let d = startDate; d <= endDate; d = addDays(d, 1)) out.push(d);
  return out;
}

function nights(a, b) {
  return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86400000);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function hasPricingForStay(pricing, startDate, endDate) {
  const stayNights = nights(startDate, endDate);
  return pricing.some((range) => {
    if (range.startDate > startDate) return false;
    if (range.endDate < endDate) return false;
    if (range.minimumStayNights && stayNights < range.minimumStayNights) return false;
    return true;
  });
}

function bookedNight(reservations, date) {
  return reservations.find((res) => date >= res.checkIn && date < res.checkOut) || null;
}

function hasBookedNightBefore(reservations, startDate, endDate) {
  return reservations.some((res) => overlaps(startDate, endDate, res.checkIn, res.checkOut));
}

function statusForDate(date, reservations, pricing) {
  const minimumEnd = addDays(date, minStay);
  const isPast = date < today;
  const booked = bookedNight(reservations, date);
  const isCheckIn = reservations.some((res) => res.checkIn === date);
  const isCheckOut = reservations.some((res) => res.checkOut === date);
  const hasMinPricing = !isPast && hasPricingForStay(pricing, date, minimumEnd);
  const minStayOverlapsBooking = !isPast && hasBookedNightBefore(reservations, date, minimumEnd);
  const selectableCheckIn = !isPast && hasMinPricing && !isCheckIn && !(booked && !isCheckOut) && !minStayOverlapsBooking;

  let reason = "available-check-in";
  if (isPast) reason = "past";
  else if (!hasMinPricing) reason = "no-direct-price-for-min-stay";
  else if (isCheckIn) reason = "reservation-check-in";
  else if (booked && !isCheckOut) reason = "booked-night";
  else if (minStayOverlapsBooking) reason = "min-stay-overlaps-booking";

  const validCheckOuts = [];
  if (selectableCheckIn) {
    for (let out = addDays(date, minStay); out <= addDays(date, 60); out = addDays(out, 1)) {
      if (!hasPricingForStay(pricing, date, out)) break;
      if (hasBookedNightBefore(reservations, date, out)) break;
      validCheckOuts.push(out);
    }
  }

  return { date, booked: Boolean(booked), bookedBy: booked?.checkIn ? `${booked.checkIn}->${booked.checkOut}` : null, isCheckIn, isCheckOut, selectableCheckIn, reason, validCheckOuts };
}

const res = await fetch(`${baseUrl}/api/availability`, { cache: "no-store" });
if (!res.ok) throw new Error(`Availability API failed: ${res.status}`);
const data = await res.json();
if (!data.ok) throw new Error(`Availability API returned ok=false`);

const reservations = data.reservations.map((r) => ({ checkIn: r.checkIn, checkOut: r.checkOut, status: r.status, isOwnerWeek: r.isOwnerWeek }));
const pricing = data.directPricing;
const days = eachDay(start, end).map((date) => statusForDate(date, reservations, pricing));

const reservationCoverageProblems = [];
for (const reservation of reservations) {
  for (let d = reservation.checkIn; d < reservation.checkOut; d = addDays(d, 1)) {
    const day = days.find((item) => item.date === d);
    if (day && !day.booked) reservationCoverageProblems.push({ date: d, reservation });
  }
}

const adjacentCheckoutProblems = [];
for (const reservation of reservations) {
  const checkout = days.find((item) => item.date === reservation.checkOut);
  const sameDayNextStay = reservations.some((other) => other.checkIn === reservation.checkOut);
  if (checkout && checkout.booked && !sameDayNextStay) adjacentCheckoutProblems.push({ date: reservation.checkOut, reservation, problem: "checkout date should not itself be a booked night unless another stay checks in that day" });
}

const suspiciousAvailable = days.filter((day) => day.selectableCheckIn && reservations.some((res) => overlaps(day.date, addDays(day.date, minStay), res.checkIn, res.checkOut)));
const selectable = days.filter((day) => day.selectableCheckIn).map((day) => day.date);
const blocked = days.filter((day) => !day.selectableCheckIn).reduce((acc, day) => {
  acc[day.reason] = (acc[day.reason] || 0) + 1;
  return acc;
}, {});

const boundaryDates = Array.from(new Set(reservations.flatMap((res) => [addDays(res.checkIn, -5), addDays(res.checkIn, -1), res.checkIn, addDays(res.checkIn, 1), addDays(res.checkOut, -1), res.checkOut, addDays(res.checkOut, 1)]))).sort();
const boundary = days.filter((day) => boundaryDates.includes(day.date));

const report = {
  baseUrl,
  today,
  range: { start, end },
  minStay,
  reservations,
  directPricing: pricing,
  summary: {
    daysChecked: days.length,
    selectableCheckInCount: selectable.length,
    firstSelectableCheckIn: selectable[0] || null,
    lastSelectableCheckIn: selectable.at(-1) || null,
    blockedReasonCounts: blocked,
    reservationCoverageProblemCount: reservationCoverageProblems.length,
    adjacentCheckoutProblemCount: adjacentCheckoutProblems.length,
    suspiciousAvailableCount: suspiciousAvailable.length,
  },
  selectableCheckIns: selectable,
  boundary,
  reservationCoverageProblems,
  adjacentCheckoutProblems,
  suspiciousAvailable,
};

console.log(JSON.stringify(report, null, 2));
if (reservationCoverageProblems.length || adjacentCheckoutProblems.length || suspiciousAvailable.length) process.exitCode = 1;
