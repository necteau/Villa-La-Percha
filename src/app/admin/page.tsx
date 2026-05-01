import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin/adminData";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  const metrics = [
    ["Owners", data.ownerCount],
    ["Properties", data.propertyCount],
    ["Live properties", data.livePropertyCount],
    ["Open inquiries", data.openInquiryCount],
    ["Lead customers", data.leadCustomerCount],
    ["Reservations", data.reservationCount],
  ];

  return (
    <div>
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Phase 1 · read-only</p>
          <h2>Admin dashboard</h2>
          <p>Production-safe visibility across owners and properties. No admin write actions are exposed in this phase.</p>
        </div>
      </header>
      <section className="admin-grid">
        {metrics.map(([label, value]) => <article className="admin-card" key={label}><span className="admin-muted">{label}</span><div className="admin-metric">{value}</div></article>)}
      </section>
      <section className="admin-detail-grid admin-section">
        <article className="admin-card">
          <h3>Recent owners</h3>
          <ul className="admin-list">{data.owners.map((owner) => <li key={owner.id}><Link href={`/admin/owners/${owner.id}`}>{owner.displayName}</Link><br/><span className="admin-muted">{owner.properties.length} properties · {owner.primaryUser?.email || "no primary user"}</span></li>)}</ul>
        </article>
        <article className="admin-card">
          <h3>Recently updated properties</h3>
          <ul className="admin-list">{data.properties.map((property) => <li key={property.id}><Link href={`/admin/properties/${property.id}`}>{property.name}</Link><br/><span className="admin-muted">{property.owner.displayName} · /{property.slug}</span></li>)}</ul>
        </article>
      </section>
    </div>
  );
}
