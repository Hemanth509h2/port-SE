import { notFound } from 'next/navigation';
import SiteRenderer from '@/components/site/SiteRenderer';
import { loadPage, pageMetadata } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return pageMetadata(await loadPage(slug));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await loadPage(slug);
  if (!data) notFound();
  return <SiteRenderer global={data.global} page={data.page} />;
}
