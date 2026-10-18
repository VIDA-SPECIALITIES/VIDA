// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// The production domain has not been decided. Set SITE_URL (in the shell or a
// local .env file, see .env.example) once it is. While unset, `site` stays
// undefined: no canonical / og:url tags and no sitemap are emitted. Never
// hard-code a guess.
const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

/** @param {string | undefined} value */
function parseSiteUrl(value) {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    throw new Error(`SITE_URL must be an absolute URL such as https://example.org (received "${value}")`);
  }
}

const site = parseSiteUrl(SITE_URL);

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: site ? [sitemap({ filter: (page) => !page.includes('/design-system/') })] : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
