import Link from "next/link";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPreviewBuilds } from "@/lib/platformLeads";

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function previewHref(slug: string) {
  return slug.startsWith("http") ? slug : `/p/${slug}?view=guest`;
}

export default async function AdminPreviewBuildsPage() {
  const admin = await getAdminSession();
  const previews = await getAdminPreviewBuilds();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.preview_builds", entityType: "PreviewBuild", metadata: { count: previews.length } });

  return (
    <div>
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Protected shortcut index</p>
          <h2>Preview Builds</h2>
          <p>Admin-only list of DirectStay Preview Build links. The previews remain public-obscure drafts; this index is behind admin login so Jaimal does not need to hunt through chat links.</p>
        </div>
        <span className="admin-chip">{previews.length} latest</span>
      </header>

      <div className="admin-table-wrap">
        <table className="admin-table admin-activity-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Status</th>
              <th>Lead</th>
              <th>Property</th>
              <th>Links</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {previews.map((preview) => {
              const href = previewHref(preview.slug);
              return (
                <tr key={preview.id}>
                  <td>{preview.heroTitle || preview.propertyName}<br /><span className="admin-muted">{preview.location || "No location"}</span></td>
                  <td><span className="admin-chip">{preview.status.replaceAll("_", " ")}</span></td>
                  <td><Link href={`/admin/platform-leads/detail?leadId=${preview.platformLead.id}`}>{preview.platformLead.fullName}</Link><br /><span className="admin-muted">{preview.platformLead.email}</span></td>
                  <td>{preview.platformLead.propertyName || preview.propertyName || "—"}<br /><span className="admin-muted">{preview.platformLead.propertyLocation || "—"}</span></td>
                  <td><Link href={href}>Open preview</Link><br /><Link href={`/admin/platform-leads/detail?leadId=${preview.platformLead.id}`}>Open lead</Link></td>
                  <td>{formatDate(preview.updatedAt)}</td>
                </tr>
              );
            })}
            {previews.length === 0 ? <tr><td colSpan={6}><span className="admin-muted">No Preview Builds yet.</span></td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
