# VIDA Specialities Limited — corporate website

Astro 7 + Tailwind CSS 4 + TypeScript (strict). Static output. Node ≥ 22.22 (developed on 24).

## Non-negotiable rules

1. **Company name:** always **VIDA Specialities Limited**. This applies to copy, page titles, metadata, alt text, structured data, the footer and commit messages. Use `COMPANY_NAME` from `src/data/site.ts`; don't hard-code it. (Confirmed by the client on 2026-10-20, replacing the earlier "Specialties" decision of 2026-10-17.) Never write "Specialties". This spelling matches the supplied logo lockup ("SPECIALITIES LIMITED") and the email domain `vidaspecialities.com`. The content PDF's body copy spells it "Specialties"; transcriptions are normalised to the confirmed spelling.
2. **Approved content only.** Site copy comes from `docs/brand-reference/VIDA Web content.pdf`, transcribed in `docs/approved-content.md` (with documented corrections). Do not paraphrase, embellish or "improve" it without client approval.
3. **Approved vision** = the typed text in the content PDF (`VISION` in `src/data/site.ts`). Never substitute, merge with or rewrite it to match the infographic version.
4. **Never invent:** product claims or benefits, health/nutrition/efficacy statements, certifications (NAFDAC, ISO, HACCP, etc.), regulatory approvals, named partners or customers, statistics, testimonials, awards, launch dates, prices, stockists, team members, founding dates, or final packaging/labels. If a page seems to need one of these, leave it out and raise it with the client.
5. **Product disclaimer:** every page or section that presents VIDA IMMUNE, VIDA RADIANCE, VIDA EDGE or the Base Water Standard must show `PRODUCT_DISCLAIMER` from `src/data/site.ts` verbatim. Products are always "concepts" or "under development", never "available".
6. **Contact details:** use only the values in `CONTACT` (`src/data/site.ts`). Don't add social links, forms posting to third parties, or maps without approval.
7. **Creative direction is not copy.** The notes in the PDF addressed to the build team (listed in `docs/approved-content.md`) must never appear on the site.
8. **Imagery:** don't crop further images from the PDFs. The only extracted image is the documented temporary bottle (`src/assets/temporary/`), which must not be presented as final packaging.
9. **Logo:** use only the traced SVGs via `Logo.astro`. Never stretch, distort, redraw, retype, recolour outside the palette, or break the clear-space and minimum sizes in `docs/design-system.md`.
10. **Domain:** undecided. It's configured only through `SITE_URL` (`.env.example`). Never hard-code or assume a production URL. The email domain is not the website domain. The sitemap and canonical/og:url tags appear only when it is set.
11. **Indexing:** `INDEXING_APPROVED` in `src/data/site.ts` is `false`, so every page is `noindex, nofollow` and `robots.txt` disallows crawling. Set it to `true` only on the client's instruction at launch.
12. **Contact form:** no message delivery is configured. The form validates input, then opens a pre-filled email in the visitor's own email app (`mailto:`), and says so. Never word it as if the website sends or receives messages. Add server delivery only once an endpoint is configured **and tested**, then update the copy.
13. **Never edit or delete** anything in `docs/brand-reference/`.
14. **No deploying, domain purchases or paid services** without explicit instruction.

## Project map

```
docs/brand-reference/      Client source files (read-only, committed)
docs/approved-content.md   Searchable transcript of approved copy + decisions + corrections
docs/design-system.md      Working design system (colours, type, logo rules, imagery, open items)
docs/source-asset-inventory.md  What source artwork exists, at what resolution, and what it can faithfully support
docs/bottle-specification.md   Artifact 002 bottle record: stated / inferred / conflicting / to-confirm (PG-002, PDF p.2)
docs/product/claims-register.md      Content and claim validation register — check before adding any copy
src/data/site.ts           Single source for company name, vision/mission/purpose, contact, nav, disclaimer
src/data/vida-variants.ts  Collection viewer data (colours + card/sleeve copy, derived from concepts.ts)
src/scripts/bottle-viewer.ts  three.js 360° viewer, lazy-loaded by CollectionSection
src/data/concepts.ts       Single source for the IMMUNE / RADIANCE / EDGE concepts (copy + specifications) used on Our Portfolio
src/styles/global.css      Tailwind v4 @theme design tokens + base styles
src/assets/brand/          Logo SVGs traced 1:1 from the logo PDF (fill = currentColor)
src/assets/temporary/      Temporary assets awaiting production replacements (documented)
src/components/             Logo (wordmark default | lockup; `decorative`), Header (responsive nav), Footer,
                           PageHero, RailLabel, NextPage, BottleConcept, ProductDisclaimer, CtaLink,
                           CollectionSection + BottleCard (VIDA Collection, three.js 360° viewer),
                           ConceptSpecifications (#specifications)
src/layouts/BaseLayout.astro  <head>: title pattern, favicons, robots, JSON-LD, canonical/og:url only when SITE_URL is set
src/layouts/SiteLayout.astro  Public page shell: skip link, header, <main>, footer, scroll reveal
src/pages/                 index, our-story, our-philosophy, our-portfolio, partnerships, contact, 404,
                           robots.txt.ts; design-system.astro is internal (always noindex, excluded from the sitemap)
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

Content-to-page mapping (all six pages are built this way; interface labels that aren't in the PDF are listed in `docs/approved-content.md` for client review):
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
- Public pages use `SiteLayout`. Indexing is controlled site-wide by `INDEXING_APPROVED`; pass `noindex` only for pages that must never be indexed (e.g. `/design-system/`, 404).
- Scroll reveal: add `data-reveal` to an element. It's hidden only when JS runs and is shown immediately under `prefers-reduced-motion`.
- Spelling follows the approved copy, which is mostly British ("honour", "colour"); keep "recognized" in the vision as written.
