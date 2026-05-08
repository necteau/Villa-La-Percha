import { redirect } from "next/navigation";

export const metadata = { robots: { index: false, follow: false } };

export default async function LegacyPreviewBuildPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string }> }) {
  const { slug } = await params;
  const { view } = await searchParams;
  redirect(`/p/${slug}${view ? `?view=${encodeURIComponent(view)}` : ""}`);
}
