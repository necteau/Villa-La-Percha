import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminOwner } from "@/lib/admin/adminData";

export default async function AdminOwnerDetailPage({ params }: { params: Promise<{ ownerId: string }> }) {
  const { ownerId } = await params;
  const admin = await getAdminSession();
  const owner = await getAdminOwner(ownerId);
  if (!owner) notFound();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.owner", entityType: "Owner", entityId: owner.id, ownerId: owner.id });
  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">Owner detail</p><h2>{owner.displayName}</h2><p>{owner.supportEmail || "No support email"} · {owner.supportPhone || "No support phone"}</p></div><span className="admin-chip">read only</span></header>
      <section className="admin-detail-grid">
        <article className="admin-card"><h3>Account</h3><p>Primary user: {owner.primaryUser?.email || "—"}</p><p>Properties: {owner._count.properties}</p><p>Customers: {owner._count.customers}</p><code>{owner.id}</code></article>
        <article className="admin-card">
          <h3>Owner workspace context</h3>
          <p className="admin-muted">Open the owner portal scoped to this owner. Phase 6 keeps this as inspection-only admin mode.</p>
          <form className="admin-form-stack" action={`/admin/owners/${owner.id}/context`} method="post">
            <button type="submit">View owner workspace</button>
          </form>
        </article>
        <article className="admin-card"><h3>Members</h3><ul className="admin-list">{owner.members.map((m) => <li key={m.id}>{m.user.fullName || m.user.email}<br/><span className="admin-muted">{m.user.email} · {m.user.role}</span></li>)}</ul></article>
      </section>
      <section className="admin-section admin-card"><h3>Properties</h3><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Status</th><th>Slug</th><th>Domain</th><th>Inquiry email</th></tr></thead><tbody>{owner.properties.map((p) => <tr key={p.id}><td><Link href={`/admin/properties/${p.id}`}>{p.name}</Link></td><td><span className="admin-chip">{p.status}</span></td><td>/{p.slug}</td><td>{p.publicDomain || "—"}</td><td>{p.inquiryEmail || "—"}</td></tr>)}</tbody></table></div></section>
      <section className="admin-section admin-card"><h3>Recent customers</h3><ul className="admin-list">{owner.customers.map((c) => <li key={c.id}>{c.fullName} · {c.email}<br/><span className="admin-muted">{c.status} · updated {c.updatedAt.toISOString().slice(0,10)}</span></li>)}</ul></section>
    </div>
  );
}
