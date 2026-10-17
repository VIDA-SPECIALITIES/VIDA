// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// The production domain has not been decided. Set SITE_URL (in the shell or a
// local .env file, see .env.example) once it is. While unset, `site` stays
// undefined and no canonical / og:url tags are emitted. Never hard-code a guess.
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

// https://astro.build/config
export default defineConfig({
  site: parseSiteUrl(SITE_URL),
  vite: {
    plugins: [tailwindcss()],
  },
});
