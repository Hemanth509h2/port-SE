import { notFound } from 'next/navigation';
import SiteRenderer from '@/components/site/SiteRenderer';
import { loadPage, pageMetadata } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return pageMetadata(await loadPage('home'));
}

export default async function Home() {
  const data = await loadPage('home');
  if (!data) notFound();
  return <SiteRenderer global={data.global} page={data.page} />;
}
