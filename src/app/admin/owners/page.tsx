import Link from "next/link";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminOwners } from "@/lib/admin/adminData";

export default async function AdminOwnersPage() {
  const admin = await getAdminSession();
  const owners = await getAdminOwners();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.owners", entityType: "Owner", metadata: { count: owners.length } });
  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">Read-only</p><h2>Owners</h2><p>Owner account scope, primary users, property counts, and customer counts.</p></div></header>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Owner</th><th>Primary user</th><th>Properties</th><th>Customers</th><th>Created</th></tr></thead><tbody>
        {owners.map((owner) => <tr key={owner.id}><td><Link href={`/admin/owners/${owner.id}`}>{owner.displayName}</Link><br/><code>{owner.id}</code></td><td>{owner.primaryUser?.email || "—"}</td><td>{owner._count.properties}</td><td>{owner._count.customers}</td><td>{owner.createdAt.toISOString().slice(0,10)}</td></tr>)}
      </tbody></table></div>
    </div>
  );
}
