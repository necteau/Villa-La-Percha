import Link from "next/link";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPlatformLeads } from "@/lib/platformLeads";

export default async function AdminPlatformLeadsPage() {
  const admin = await getAdminSession();
  const leads = await getAdminPlatformLeads();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.platform_leads", entityType: "PlatformLead", metadata: { count: leads.length } });

  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">Owner acquisition</p><h2>Platform Leads</h2><p>DirectStay business-development prospects from the public owner intake funnel.</p></div><span className="admin-chip">{leads.length} latest</span></header>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Lead</th><th>Status</th><th>Location</th><th>Properties</th><th>Goal</th><th>Created</th></tr></thead><tbody>
        {leads.map((lead) => <tr key={lead.id}><td><Link href={`/admin/platform-leads/${lead.id}`}>{lead.fullName}</Link><br/><span className="admin-muted">{lead.email}</span></td><td><span className="admin-chip">{lead.status}</span></td><td>{lead.propertyLocation || "—"}</td><td>{lead.propertyCount || "—"}</td><td>{lead.goal || "—"}</td><td>{lead.createdAt.toISOString().slice(0,10)}</td></tr>)}
      </tbody></table></div>
    </div>
  );
}
