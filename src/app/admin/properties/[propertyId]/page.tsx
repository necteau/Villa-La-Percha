import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProperty } from "@/lib/admin/adminData";

export default async function AdminPropertyDetailPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const property = await getAdminProperty(propertyId);
  if (!property) notFound();
  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">Property detail</p><h2>{property.name}</h2><p>Owner: <Link href={`/admin/owners/${property.owner.id}`}>{property.owner.displayName}</Link> · /{property.slug}</p></div><span className="admin-chip">{property.status}</span></header>
      <section className="admin-grid">
        <article className="admin-card"><span className="admin-muted">Reservations</span><div className="admin-metric">{property._count.reservations}</div></article>
        <article className="admin-card"><span className="admin-muted">Inquiries</span><div className="admin-metric">{property._count.inquiries}</div></article>
        <article className="admin-card"><span className="admin-muted">Pricing rules</span><div className="admin-metric">{property._count.pricingRules}</div></article>
        <article className="admin-card"><span className="admin-muted">Minimum stay</span><div className="admin-metric">{property.minimumStayNights || "—"}</div></article>
      </section>
      <section className="admin-detail-grid admin-section">
        <article className="admin-card"><h3>Settings</h3><p>Domain: {property.publicDomain || "—"}</p><p>Inquiry email: {property.inquiryEmail || "—"}</p><p>Timezone: {property.timezone}</p><p>Currency: {property.currency}</p><p>Inquiry enabled: {property.inquiryEnabled ? "yes" : "no"}</p></article>
        <article className="admin-card"><h3>Content flags</h3><p>FAQ: {property.content?.faqEnabled ? "enabled" : "disabled/missing"}</p><p>Experience page: {property.content?.experiencePageEnabled ? "enabled" : "disabled/missing"}</p><p>{property.content?.headline || "No headline configured"}</p></article>
      </section>
      <section className="admin-section admin-card"><h3>Recent inquiries</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Guest</th><th>Email</th><th>Status</th><th>Created</th></tr></thead><tbody>{property.inquiries.map((i) => <tr key={i.id}><td>{i.fullName}</td><td>{i.email}</td><td>{i.status}</td><td>{i.createdAt.toISOString().slice(0,10)}</td></tr>)}</tbody></table></div></section>
      <section className="admin-section admin-card"><h3>Recent reservations</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Guest</th><th>Status</th><th>Source</th><th>Dates</th></tr></thead><tbody>{property.reservations.map((r) => <tr key={r.id}><td>{r.guestName || "—"}</td><td>{r.status}</td><td>{r.source}</td><td>{r.checkIn.toISOString().slice(0,10)} → {r.checkOut.toISOString().slice(0,10)}</td></tr>)}</tbody></table></div></section>
    </div>
  );
}
