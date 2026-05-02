import { getAdminSession } from "@/lib/admin/adminAuth";
import { getAdminActivityLog, recordAdminAuditEvent } from "@/lib/admin/auditLog";

function formatMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return "—";
  const entries = Object.entries(metadata as Record<string, unknown>);
  if (!entries.length) return "—";
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
}

export default async function AdminActivityPage() {
  const admin = await getAdminSession();
  const activity = await getAdminActivityLog();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.activity", entityType: "AuditLog", entityId: "/admin/activity", metadata: { count: activity.length } });

  return (
    <div>
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Phase 2 · accountability</p>
          <h2>Activity</h2>
          <p>Reverse-chronological audit trail for admin portal reads and denied access attempts. Still read-only; no risky admin writes are exposed.</p>
        </div>
        <span className="admin-chip">{activity.length} latest</span>
      </header>
      <div className="admin-table-wrap">
        <table className="admin-table admin-activity-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.createdAt.toISOString().replace("T", " ").slice(0, 19)} UTC</td>
                <td>{entry.actorEmail || "unknown"}<br /><span className="admin-muted">{entry.actorRole || "—"}</span></td>
                <td><code>{entry.action}</code></td>
                <td>{entry.entityType}<br /><code>{entry.entityId || "—"}</code></td>
                <td>{entry.ownerId ? <span>owner <code>{entry.ownerId}</code><br /></span> : null}{entry.propertyId ? <span>property <code>{entry.propertyId}</code><br /></span> : null}<span className="admin-muted">{formatMetadata(entry.metadata)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
