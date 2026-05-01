import Link from "next/link";
import { getAdminProperties } from "@/lib/admin/adminData";

export default async function AdminPropertiesPage() {
  const properties = await getAdminProperties();
  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">Read-only</p><h2>Properties</h2><p>DirectStay property inventory, owner relationships, inquiry counts, and reservation counts.</p></div></header>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Property</th><th>Owner</th><th>Status</th><th>Reservations</th><th>Inquiries</th><th>Pricing</th></tr></thead><tbody>
        {properties.map((property) => <tr key={property.id}><td><Link href={`/admin/properties/${property.id}`}>{property.name}</Link><br/><code>/{property.slug}</code></td><td><Link href={`/admin/owners/${property.owner.id}`}>{property.owner.displayName}</Link></td><td><span className="admin-chip">{property.status}</span></td><td>{property._count.reservations}</td><td>{property._count.inquiries}</td><td>{property._count.pricingRules}</td></tr>)}
      </tbody></table></div>
    </div>
  );
}
