import type { APIRoute } from 'astro';
import { INDEXING_APPROVED } from '../data/site';

// Crawling stays disallowed until the client approves launch (INDEXING_APPROVED).
// The sitemap is referenced only when SITE_URL is configured.
export const GET: APIRoute = ({ site }) => {
  const lines = INDEXING_APPROVED
    ? ['User-agent: *', 'Allow: /', 'Disallow: /design-system/']
    : ['User-agent: *', 'Disallow: /'];
  if (INDEXING_APPROVED && site) lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
