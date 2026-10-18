import type { APIRoute } from 'astro';
import { INDEXING_APPROVED } from '../data/site';

const PREVIEW_BOTS = [
  'facebookexternalhit', // Facebook, WhatsApp, Instagram, Messenger
  'WhatsApp',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot-LinkExpanding',
  'TelegramBot',
  'Discordbot',
];

// Crawling stays disallowed until the client approves launch (INDEXING_APPROVED).
// The sitemap is referenced only when SITE_URL is configured.
export const GET: APIRoute = ({ site }) => {
  const lines = INDEXING_APPROVED
    ? ['User-agent: *', 'Allow: /', 'Disallow: /design-system/']
    : [
        // Link-preview fetchers (not search indexes) may read pages so that
        // shared links show a title, description and image.
        ...PREVIEW_BOTS.map((bot) => `User-agent: ${bot}`),
        'Allow: /',
        '',
        'User-agent: *',
        'Disallow: /',
      ];
  if (INDEXING_APPROVED && site) lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
