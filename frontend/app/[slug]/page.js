import { notFound } from 'next/navigation';
import SiteRenderer from '@/components/site/SiteRenderer';
import { loadPage, pageMetadata } from '@/lib/server';

export const dynamic = 'force-dynamic';

// Page slugs never contain a dot; this keeps requests like /favicon.ico from hitting the backend.
const isPageSlug = (slug) => !slug.includes('.');

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return isPageSlug(slug) ? pageMetadata(await loadPage(slug)) : {};
}

export default async function Page({ params }) {
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();
  const data = await loadPage(slug);
  if (!data) notFound();
  return <SiteRenderer global={data.global} page={data.page} />;
}
