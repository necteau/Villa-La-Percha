import { redirect } from "next/navigation";

export default async function AdminPlatformLeadCanonicalRedirect({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
}
