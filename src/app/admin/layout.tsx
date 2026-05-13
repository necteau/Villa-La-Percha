import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import "./styles.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminSession();

  return (
    <div className="admin-shell">
      <aside className="admin-rail">
        <div>
          <p className="admin-eyebrow">DirectStay</p>
          <h1>Admin</h1>
          <p className="admin-muted">Read-only control plane</p>
        </div>
        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/owners">Owners</Link>
          <Link href="/admin/properties">Properties</Link>
          <Link href="/admin/platform-leads">Platform Leads</Link>
          <Link href="/admin/previews">Preview Builds</Link>
          <Link href="/admin/preview-benchmarks">Preview Benchmarks</Link>
          <Link href="/admin/activity">Activity</Link>
          <span aria-disabled="true">Settings · coming soon</span>
        </nav>
        <div className="admin-user">
          <span>{admin.fullName || admin.email}</span>
          <code>{admin.role}</code>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
