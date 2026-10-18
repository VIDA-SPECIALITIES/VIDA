---
name: vida-website
description: Implementation and quality-assurance workflow for the VIDA Specialties Limited website. Use whenever building, editing or reviewing any page, section, component, copy, metadata or styling in this project.
---

# VIDA website: implementation and QA workflow

Read `CLAUDE.md` first. Its non-negotiable rules override anything here.

## 1. Before writing code

1. Identify the page or section and its approved source text in `docs/approved-content.md`. If no approved text exists for what's needed, **stop and list the gap** rather than writing filler copy.
2. Check `docs/design-system.md` for the relevant tokens, logo rules and components. Reuse existing components before creating new ones.
3. Confirm the page is in scope. Building a full page needs explicit client authorisation.

## 2. Implementation

1. **Copy:** paste approved text exactly, including the documented corrections (e.g. "everyday experiences"). Pull shared facts (company name, vision/mission/purpose, contact, disclaimer, nav) from `src/data/site.ts`; never retype them.
2. **Layout:** public pages use `SiteLayout` with `title` (the page name only; the layout appends "| VIDA Specialties Limited") and a `description` built from approved copy. Indexing is controlled site-wide by `INDEXING_APPROVED` (currently `false`). Pass `noindex` only for pages that must never be indexed. Any new label that isn't in the approved copy must be added to the "Interface labels" table in `docs/approved-content.md`.
3. **Styling:** use Tailwind utilities backed by `@theme` tokens (`bg-mist`, `text-navy`, `text-display-md`, `eyebrow`, `container-site`, `py-section`, …). No raw hex values, and no font families other than `font-display` and `font-sans`.
4. **Logo:** use `<Logo />` (wordmark). Where the full name is needed, set `COMPANY_NAME` as text next to it and pass `decorative`. Respect the clear space (¼ letter height) and minimum widths (wordmark 96px, lockup 240px). Use the lockup only if the client has approved it.
5. **Accessibility:** one `<h1>` per page; headings in logical order; `<header>`, `<nav aria-label>`, `<main>`, `<footer>` landmarks; descriptive link text; visible focus; text contrast ≥ 4.5:1 (≥ 3:1 for text ≥ 24px). Don't use `clay` for text on light backgrounds, and don't go lighter than `text-navy/70` for text under 24px on mist (`navy/60` is only 3.5:1).
   Layout: place section labels in the left rail with `RailLabel` (cols 1–3) and content in cols 4–12; divide with hairlines rather than boxed cards; end inner pages with `NextPage`.
6. **Motion:** subtle fades or translations ≤ 24px using `ease-calm`, durations of 400–900ms. Everything must degrade under `prefers-reduced-motion`.
7. **Imagery:** use `astro:assets` `<Image>`. The temporary bottle (`src/assets/temporary/living-curve-concept.png`) must be ≤ 273px display height (the homepage hero uses the separate 1536 × 2304 render in `src/assets/renders/`; see design-system.md) with `width={68}` and `densities={[1, 2]}`, and sit on `bg-mist` only (its background is tinted to exactly `#EDEFF0`). For anything bigger, use a labelled placeholder and report the gap.
8. **Products:** present them as concepts under development and include `PRODUCT_DISCLAIMER` on the same page.
9. **URLs:** never hard-code a domain. Use relative links and `Astro.site` (from `SITE_URL`) only where an absolute URL is required, and handle it being undefined.

## 3. Quality assurance (run all before reporting done)

### Automated
```bash
npm run check   # must report 0 errors, 0 warnings
npm run build   # must complete
```

### Content audit (grep the built output and source)
```bash
# Company name: "Specialities" is allowed only in the email address, the logo-lockup SVG and the docs that explain the mismatch
# (the internal /design-system/ page and the Logo.astro comment name the lockup's spelling on purpose and are excluded)
grep -rnioE "(^|[^a-z])specialities" dist/ src/ --include='*.html' --include='*.astro' --include='*.ts' \
  | grep -v "design-system\|Logo.astro" && echo "FAIL: wrong company name spelling" || echo "OK: name"
grep -rn "Our Approach\|our-approach" dist/ src/ && echo "FAIL: old nav label/route" || echo "OK: nav"
# -w (whole words) so bundled JS such as preventDefault() does not match "prevent"
grep -rniwE "nafdac|iso ?[0-9]+|certified|certification|approved by|clinically|proven|guarantee[ds]?|cures?|prevents?|boosts? immunity|lorem|ipsum|TODO" dist/ \
  && echo "REVIEW: possible unsupported claim or placeholder" || echo "OK: claims"
grep -rn "every day experiences" dist/ src/ && echo "FAIL: uncorrected 'every day'" || echo "OK: everyday"
```
- Any page that mentions IMMUNE, RADIANCE, EDGE or "Base Water" must contain the disclaimer:
```bash
for f in $(grep -rlE "IMMUNE|RADIANCE|EDGE|BASE WATER" dist --include=*.html); do grep -q "Products shown are currently under development" "$f" || echo "FAIL: disclaimer missing in $f"; done
```
- The vision appears only as the typed version ("…wellness beverage companies, recognized globally for products built on trust…"). Check it doesn't contain the infographic wording "premium hydration company".
- Compare every visible sentence on the page against `docs/approved-content.md`. Anything not traceable to it must be removed or flagged.
- Check that the contact details match `CONTACT` exactly (email `hello@vidaspecialities.com`, phone +234 803 332 2188, WhatsApp +234 809 332 2188, the Abuja address).
- Check that none of the creative-direction sentences in `docs/approved-content.md` appear on the site.

### Metadata
- `<title>` follows "<Page> \| VIDA Specialties Limited" (the homepage uses the company name alone).
- Meta description is present, comes from approved copy, and is ≤ 160 characters where practical.
- `lang="en-NG"` is set. Favicons are linked. `noindex` is present on unapproved pages and absent on pages approved for launch.
- With `SITE_URL` unset: there are no `canonical` or `og:url` tags. With it set (`SITE_URL=https://example.org npm run build` as a test), they appear and use that origin.

### Visual (headless Chrome is available at `/Applications/Google Chrome.app`)
1. `npm run build && npx astro preview --port 4329` (run it in the background).
2. Take screenshots at 1440×900 and 768×1024. For 390px, headless Chrome clamps the window to about 500px, so load the page in a 390px-wide `<iframe>` from a scratch HTML file instead.
3. Check: no horizontal overflow, logo crisp and in the correct colour with its clear space, generous negative space, accents used sparingly, text legible on every background, temporary bottle not blurry.
4. Stop the preview server afterwards.

## 4. Report

State exactly:
- Files created or changed.
- The results of check, build and each audit (paste failures verbatim).
- Placeholders or temporary assets used, plus copy or asset gaps that need client input.
- Anything skipped, and why.
