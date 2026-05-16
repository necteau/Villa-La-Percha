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
        <span className="admin-chip">{previews.length} properties</span>
      </header>

      <div className="admin-preview-card-list">
        {previews.map((preview) => {
          const href = previewHref(preview.slug);
          const property = preview.platformLead.propertyName || preview.propertyName || "Unnamed property";
          const location = preview.platformLead.propertyLocation || preview.location || "No location";
          return (
            <article className="admin-card admin-preview-card" key={preview.id}>
              <div>
                <p className="admin-eyebrow">{location}</p>
                <h3>{preview.heroTitle || property}</h3>
                <p className="admin-muted">{property}</p>
              </div>
              <div className="admin-preview-card-meta">
                <span className="admin-chip">{preview.status.replaceAll("_", " ")}</span>
                {preview.duplicatePreviewCount > 1 ? <span className="admin-chip admin-chip-warn">latest of {preview.duplicatePreviewCount}</span> : null}
                <span className="admin-muted">Updated {formatDate(preview.updatedAt)}</span>
              </div>
              <div className="admin-preview-card-body">
                <span><strong>Lead</strong><Link href={`/admin/platform-leads/detail?leadId=${preview.platformLead.id}`}>{preview.platformLead.fullName}</Link><br /><span className="admin-muted">{preview.platformLead.email}</span></span>
                <span><strong>Preview</strong><Link href={href}>Open guest preview</Link><br /><Link className="admin-muted" href={`/admin/platform-leads/detail?leadId=${preview.platformLead.id}`}>Open lead detail</Link></span>
              </div>
            </article>
          );
        })}
        {previews.length === 0 ? <article className="admin-card"><span className="admin-muted">No Preview Builds yet.</span></article> : null}
      </div>

      <div className="admin-table-wrap admin-preview-table-wrap">
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
                  <td><Link href={href}>Open preview</Link><br /><Link href={`/admin/platform-leads/detail?leadId=${preview.platformLead.id}`}>Open lead</Link>{preview.duplicatePreviewCount > 1 ? <><br /><span className="admin-muted">Latest of {preview.duplicatePreviewCount} drafts</span></> : null}</td>
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
