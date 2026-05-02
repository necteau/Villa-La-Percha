type WakeKind = "villa_ai_revision" | "platform_lead_intake";

type WakePayload = {
  kind: WakeKind;
  id: string;
  label?: string | null;
};

export async function triggerInternalOpsWake(payload: WakePayload) {
  const url = process.env.DIRECTSTAY_OPENCLAW_WAKE_URL;
  if (!url) return { attempted: false, ok: false, reason: "DIRECTSTAY_OPENCLAW_WAKE_URL not configured" };

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(1500),
      headers: {
        "Content-Type": "application/json",
        ...(process.env.DIRECTSTAY_OPENCLAW_WAKE_SECRET ? { Authorization: `Bearer ${process.env.DIRECTSTAY_OPENCLAW_WAKE_SECRET}` } : {}),
      },
      body: JSON.stringify({ source: "directstay", ...payload, createdAt: new Date().toISOString() }),
    });
    return { attempted: true, ok: response.ok, status: response.status };
  } catch (error) {
    console.warn("DirectStay ops wake failed", { kind: payload.kind, id: payload.id, error: error instanceof Error ? error.message : String(error) });
    return { attempted: true, ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
