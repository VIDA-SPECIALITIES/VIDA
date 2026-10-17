# VIDA Specialties Limited — corporate website

Astro 7 + Tailwind CSS 4 + TypeScript (strict). Static output. Node ≥ 22.22 (developed on 24).

## Non-negotiable rules

1. **Company name:** always **VIDA Specialties Limited**. This applies to copy, page titles, metadata, alt text, structured data, the footer and commit messages. Use `COMPANY_NAME` from `src/data/site.ts`; don't hard-code it. (Confirmed by the client 2026-10-17.) Two supplied items spell it differently and must **not** be altered:
   - the logo lockup artwork, whose descriptor reads "SPECIALITIES LIMITED" (so the UI uses the wordmark plus the name as text, see `docs/design-system.md`);
   - the approved email address `hello@vidaspecialities.com`.
2. **Approved content only.** Site copy comes from `docs/brand-reference/VIDA Web content.pdf`, transcribed in `docs/approved-content.md` (with documented corrections). Do not paraphrase, embellish or "improve" it without client approval.
3. **Approved vision** = the typed text in the content PDF (`VISION` in `src/data/site.ts`). Never substitute, merge with or rewrite it to match the infographic version.
4. **Never invent:** product claims or benefits, health/nutrition/efficacy statements, certifications (NAFDAC, ISO, HACCP, etc.), regulatory approvals, named partners or customers, statistics, testimonials, awards, launch dates, prices, stockists, team members, founding dates, or final packaging/labels. If a page seems to need one of these, leave it out and raise it with the client.
5. **Product disclaimer:** every page or section that presents VIDA IMMUNE, VIDA RADIANCE, VIDA EDGE or the Base Water Standard must show `PRODUCT_DISCLAIMER` from `src/data/site.ts` verbatim. Products are always "concepts" or "under development", never "available".
6. **Contact details:** use only the values in `CONTACT` (`src/data/site.ts`). Don't add social links, forms posting to third parties, or maps without approval.
7. **Creative direction is not copy.** The notes in the PDF addressed to the build team (listed in `docs/approved-content.md`) must never appear on the site.
8. **Imagery:** don't crop further images from the PDFs. The only extracted image is the documented temporary bottle (`src/assets/temporary/`), which must not be presented as final packaging.
9. **Logo:** use only the traced SVGs via `Logo.astro`. Never stretch, distort, redraw, retype, recolour outside the palette, or break the clear-space and minimum sizes in `docs/design-system.md`.
10. **Domain:** undecided. It's configured only through `SITE_URL` (`.env.example`). Never hard-code or assume a production URL. The email domain is not the website domain.
11. **Never edit or delete** anything in `docs/brand-reference/`.
12. **No deploying, domain purchases or paid services** without explicit instruction.

## Project map

```
docs/brand-reference/      Client source files (read-only, committed)
docs/approved-content.md   Searchable transcript of approved copy + decisions + corrections
docs/design-system.md      Working design system (colours, type, logo rules, imagery, open items)
src/data/site.ts           Single source for company name, vision/mission/purpose, contact, nav, disclaimer
src/styles/global.css      Tailwind v4 @theme design tokens + base styles
src/assets/brand/          Logo SVGs traced 1:1 from the logo PDF (fill = currentColor)
src/assets/temporary/      Temporary assets awaiting production replacements (documented)
src/components/Logo.astro  Logo component (wordmark default | lockup; `decorative` flag)
src/layouts/BaseLayout.astro  <head>: title pattern, favicons, canonical/og:url only when SITE_URL is set
src/pages/                 Routes. index.astro is a temporary holding page. design-system.astro is internal (noindex)
public/                    favicon.svg / favicon.ico / apple-touch-icon.png (from the wordmark's V)
scripts/brand/             Python scripts that regenerate the logo SVGs, favicon and temporary bottle from the PDFs
.claude/skills/vida-website/  Implementation + QA workflow — follow it for any page work
```

## Design tokens (summary — full detail in docs/design-system.md)

- Working palette: `navy #233645` (logo), `ink #0E1A2A`, `green #236F51`, `clay #CC9883`, `mist #EDEFF0`. Derived: `clay-deep #925E49`, `mist-deep #DDE1E3`, `paper #FFF`.
- **Never use `clay` for text on light backgrounds** (2.2:1 contrast). Use `clay-deep` instead.
- Fonts (working pairing, the only two families): `font-display` = Cormorant Garamond for h1–h3; `font-sans` = Montserrat for everything else.
- Use tokens and utilities (`text-display-*`, `eyebrow`, `container-site`, `py-section`). Don't use raw hex values in components.

## Site structure (approved nav order)

Home · Our Story · Our Philosophy · Our Portfolio · Partnerships · Contact. Routes are defined in `NAV` (`/`, `/our-story/`, `/our-philosophy/`, `/our-portfolio/`, `/partnerships/`, `/contact/`).

Content-to-page mapping (Our Philosophy is confirmed; the rest are proposed):
- **Home**: hero (Honour life. Elevate the everyday) → intro → Discover VIDA. Optionally add short teasers that link to the other pages, using approved lines only.
- **Our Story**: Life, Elevated + Vision / Mission / Purpose + Building an African Institution (About).
- **Our Philosophy** (confirmed, decision 11): "Everyday doesn't have to mean ordinary." + the four principles (Exceptional Water, Purposeful Nutrition, Disciplined Science, Thoughtful Design), each with only its approved sentences + the three "Every…" lines. Nothing added to fill space.
- **Our Portfolio**: One Hydration System + three concepts + Base Water Standard + disclaimer.
- **Partnerships**: Building With The Best + four areas + Partner With VIDA; The Nigerian Opportunity can sit here or on Home.
- **Contact**: approved contact block.

## Commands

```
npm run dev       # local dev server
npm run check     # astro check (types + .astro diagnostics) — must be 0 errors
npm run build     # static build to dist/ — must succeed
npm run preview   # serve dist/ locally
SITE_URL=https://… npm run build   # only once the domain is decided
```

## Conventions

- Mobile-first. No horizontal scroll at 360px. Respect `prefers-reduced-motion`.
- Semantic HTML: one `<h1>` per page, landmarks, visible focus, alt text that doesn't invent facts.
- Keep JavaScript to a minimum. Astro components are static by default; add client islands only when needed.
- Pages under development must pass `noindex` to `BaseLayout`.
- Spelling follows the approved copy, which is mostly British ("honour", "colour"); keep "recognized" in the vision as written.
