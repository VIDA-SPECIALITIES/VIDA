# VIDA design system — working foundation

Status: **Working foundation** (client decisions of 2026-10-17 applied). Implemented as tokens in `src/styles/global.css` and previewed at `/design-system/` (noindex) when running locally.

## Brand intent

From the approved content's creative direction:

- An **emerging African hydration house**, not a startup landing page.
- **Cinematic, restrained** openings, built on generous negative space.
- The **Living Curve** bottle silhouette and its idea that "every curve has a purpose".
- An institutional tone: _systems before scale, standards before speed, excellence before expansion._

These translate into the design principles below:

1. **Quiet confidence.** Large, light display type; few elements per screen; no gimmicks.
2. **Space is the luxury.** Section spacing is deliberately large (`--spacing-section`, up to 12rem).
3. **One accent at a time.** The green and clay accents are used sparingly and never compete with each other in the same view.
4. **Evidence over hype.** No badges, seals, stats or testimonials unless they are approved and substantiated.
5. **Slow motion.** Fades and gentle reveals only (`--ease-calm`). Everything respects `prefers-reduced-motion`.

## Logo

| Asset | File | Notes |
|---|---|---|
| Wordmark (VIDA) | `src/assets/brand/vida-wordmark.svg` | **Default in the interface.** Traced 1:1 from the logo PDF |
| Full lockup (VIDA + descriptor) | `src/assets/brand/vida-logo-lockup.svg` | Traced 1:1. The descriptor reads **"SPECIALITIES LIMITED"**, see below |
| Component | `src/components/Logo.astro` | `variant="wordmark" \| "lockup"` (default `wordmark`), `decorative` hides it from screen readers when the name is in adjacent text. Inherits `currentColor` |

**Name mismatch in the supplied artwork.** The confirmed company name is **VIDA Specialties Limited**, but the supplied lockup's descriptor line spells "SPECIALITIES". Altering or retyping logo artwork is not permitted. So, until the brand owner supplies corrected artwork or approves the lockup as-is:
- the interface uses the **wordmark** and sets "VIDA Specialties Limited" as live text in Montserrat where the full name is needed (header, footer, holding page);
- the lockup is kept for reference only.

### Clear space and minimum size (provisional, derived from the supplied artwork)

Measurements were taken from the vector paths, in PDF units:

| Measure | Value |
|---|---|
| Wordmark width × letter height | 444.1 × 97.7 |
| Gap between wordmark and descriptor | 25.5 (≈ ¼ of letter height) |
| Descriptor cap height | 19.3 |
| Thinnest wordmark stroke (A and V hairlines) | ≈ 5.5 |

- **Clear-space unit X = ¼ of the wordmark letter height.** This equals the spacing the designer used between the wordmark and the descriptor. Keep at least **X on every side** of the wordmark or lockup, clear of text, edges and other graphics. At 320px wordmark width, X ≈ 18px.
- **Minimum digital width:**
  - **Wordmark: 96px.** Below this the hairline strokes fall under about 1.2px and break up.
  - **Lockup: 240px.** This keeps the descriptor's cap height at about 10px and its strokes near 1px.
- **Print minimums are not set.** They need the designer's master file.
- **Never stretch** or distort (the aspect ratio is fixed by the SVG viewBox). Never rotate, outline, add effects, recolour outside the palette, re-space the letters or retype any part.
- Colourways: navy on mist (default), mist on ink, mist on green.

### Favicon

Built from an existing element of the logo: the **"V" glyph path of the supplied wordmark**, unmodified, in navy `#233645` on a mist `#EDEFF0` tile. No new symbol was drawn.

| File | Use |
|---|---|
| `public/favicon.svg` | Modern browsers (rounded tile) |
| `public/favicon.ico` | 32×32 legacy fallback |
| `public/apple-touch-icon.png` | 180×180 iOS home screen (square tile; iOS applies the rounding) |

They're linked from `BaseLayout.astro`. At 16px the V's hairline stroke softens; this is acceptable for a provisional icon. If the brand owner supplies a dedicated icon, it replaces these files.

## Colour (working palette)

Read from the vector drawing commands in `docs/brand-reference/VIDA BRAND LOGO_261016_153631.pdf` (embedded **sRGB IEC61966-2.1** profile), so they are exact for that file. This is the **working palette** by client decision. Master Pantone/CMYK references, if they exist, are still to be supplied for print.

| Token | Hex | Source | Role |
|---|---|---|---|
| `navy` | `#233645` | Logo wordmark fill | Primary text, logo, outlines |
| `ink` | `#0E1A2A` | Palette swatch 3 | Deep/cinematic backgrounds, footer |
| `green` | `#236F51` | Palette swatch 1 | Brand accent, links, focus ring, single-colour sections |
| `clay` | `#CC9883` | Palette swatch 2 (terracotta) | Warm accent: rules, highlights, eyebrows on dark |
| `mist` | `#EDEFF0` | Logo artboard background | Default page background |

### Derived

| Token | Hex | Why |
|---|---|---|
| `clay-deep` | `#925E49` | **Accessible clay for text on light backgrounds** (4.6:1 on mist). Plain `clay` is only 2.2:1 |
| `mist-deep` | `#DDE1E3` | Hairlines, dividers, quiet surfaces |
| `paper` | `#FFFFFF` | Raised surfaces, used sparingly |

### Contrast (WCAG 2.x)

| Foreground → Background | Ratio | Use |
|---|---|---|
| navy on mist | 10.8:1 | ✅ All text |
| ink on mist | 15.2:1 | ✅ All text |
| green on mist | 5.3:1 | ✅ Body text and links |
| clay-deep on mist | 4.6:1 | ✅ Body text (AA) |
| clay on mist | 2.2:1 | ❌ Decorative only, never text |
| mist on ink | 15.2:1 | ✅ All text |
| clay on ink | 7.0:1 | ✅ Eyebrows and accents on dark |
| mist on green | 5.3:1 | ✅ Text on green sections |
| clay on navy | 5.0:1 | ✅ Accent text on navy |
| green on navy / ink | 2.1:1 / 2.9:1 | ❌ Do not combine for text |

## Typography (working pairing)

| Role | Family | Usage rule |
|---|---|---|
| Display | **Cormorant Garamond** (variable, with italics) | `font-display`: h1–h3, pull quotes, principle and product names. Weight 300–500 only |
| Sans | **Montserrat** (variable) | `font-sans`: body, navigation, eyebrows, buttons, captions, forms, the company name set as text. Weight 400–500 (600 for rare emphasis) |

Consistency rules:
- These are the **only** two families. Don't introduce a third, and don't use system serif or sans stacks except as the built-in fallbacks.
- Headings (`h1`–`h3`) are always display. Everything else is sans. `h4`+ and labels use the `eyebrow` utility, not display.
- Italic display is for emphasis lines only (e.g. "Elevate the everyday"). Sans is never italicised, except for the product disclaimer, which is italic to set it apart as a notice.
- Both are self-hosted (SIL OFL) via `@fontsource-variable/*`, so there are no third-party font requests.
- The VIDA wordmark is custom lettering. **Never** set it in a font; always use the SVG.

Scale (fluid, defined in `@theme`):

| Token | Size | Leading | Use |
|---|---|---|---|
| `text-hero` | 48 → 104px (`1.5rem + 5vw`), −0.015em | 1.0 | Homepage h1 only. Sized so "Elevate the everyday" holds one line from tablet up |
| `text-display-xl` | 44 → 96px, −0.012em | 1.0 | Inner-page h1, Purpose statement, Partner with VIDA |
| `text-display-lg` | 38 → 72px, −0.01em | 1.04 | Section h2, the "Every…" lines, next-page links |
| `text-display-md` | 30 → 48px | 1.12 | Intro paragraph, principle names, partnership areas |
| `text-display-sm` | 24 → 32px | 1.22 | Vision/mission statements, product names, lead quotes |
| `text-lead` | 17 → 19px | 1.7 | Lead body paragraphs |
| base | 16px | 1.7 | Body |
| `eyebrow` utility | 12px, 500, uppercase, 0.24em tracking | 1.4 | Section labels, nav, CTAs |

Headline line breaks are set deliberately (one `<span class="block">` per line, `md:whitespace-nowrap` on the homepage hero). Don't let them reflow by accident.

## Layout and spacing

- **Editorial grid:** 12 columns. Section labels sit in a **left rail (cols 1–3)** via `RailLabel`; headings and body run in **cols 4–12**. Page heroes, homepage sections, Vision/Mission/Purpose, About, Partnership areas and the next-page link all share this rail.
- **Hairline rhythm:** sections and lists are divided by `border-navy/15–25` hairlines inside the container, not by boxes or cards.
- `container-site` utility: max width 80rem, fluid gutters (`--spacing-gutter`, 20 → 48px).
- Running text is capped at about 30–34rem (`max-w-[30rem]`, `text-lead`).
- `py-section` (96 → 192px) between major sections.
- Mobile-first. No horizontal scroll at 360px. The rail collapses above its content on phones.
- **Small-text contrast:** use no lighter than `text-navy/70` (4.6:1 on mist) for text under 24px. `navy/60` is only 3.5:1.

## Components (built)

- **Primary CTA** ("DISCOVER VIDA"): outlined, eyebrow text, slow fill on hover. Never a filled bright button.
- **Text link CTA** ("PARTNER WITH VIDA →"): eyebrow text with an underline hairline.
- **Header**: 72px tall. The wordmark plus "VIDA Specialties Limited" set as text (xl and up) on the left, five nav links in eyebrow style on the right (Home is the wordmark), collapsing to a full-screen menu on mobile. The bottom hairline appears only after scrolling.
- **RailLabel** (`RailLabel.astro`): clay hairline + eyebrow for the left rail (`tone="dark"` on ink).
- **NextPage** (`NextPage.astro`): closes each inner page except Partnerships (which ends with Partner with VIDA) and Contact. A hairline row with the index + "Next" + page name in the rail and the next page's approved heading at `text-display-lg`.
- **Footer** (ink): wordmark, "VIDA Specialties Limited" as text, approved contact details, © year.
- **Principle row** (Our Philosophy): number + principle name + only its approved sentences, on a 2×2 hairline grid (no boxes).
- **Product concept column**: "Concept · under development" eyebrow, name (`text-display-sm`, tracked), line and description, with the **disclaimer always present on the page**.
- **Homepage hero** (client brief 2026-10-18, replaces the grey studio hero): full-width cinematic coastal scene in two layers: background `vida-hero-coastal-bg.png` plus the client's Artifact 002 bottle as a separate, unfiltered `<img>` (`vida-artifact-002-glass.png`), positioned in the scene's own coordinates inside a cover-sized box so it always rests on the same rock directly under the unchanged header. Left: "HONOUR LIFE." eyebrow, uppercase display h1 "ELEVATE / THE EVERYDAY", serif supporting line, body copy, and a dark green-black pill CTA "DISCOVER VIDA →" (hero-only style, `#0F2420`). Upper right: a short rule plus "Purposeful nutrition / Disciplined science / Thoughtful design". A soft mist scrim behind the text column keeps it legible. Below 1024px, the scene shows as a bottle-centred crop above the text on mist, with the principles listed after the CTA. Caption "Bottle concept · in development" at bottom right of the scene.
- **Bottle concept** (`BottleConcept.astro`, Our Portfolio): the temporary render (≤ 273px) standing on a horizon hairline, captioned "Bottle concept · in development". No labels on the bottle. (The dashed outline was removed in Phase 2: it read as a wireframe placeholder.)
- **Living Curve outline**: used once, at full height, beside "Every curve has a purpose." on the ink band of Our Philosophy.
- **Product disclaimer** (`ProductDisclaimer.astro`): the verbatim notice with a clay rule. On Our Portfolio it appears under the hero and again after the concepts.
- **Contact form**: underline fields, inline errors plus a focusable error summary, and `mailto:` hand-off (no delivery).
- **Mobile menu**: full-screen ink panel with numbered links. Escape closes it, focus moves into the panel and returns to the toggle, and the page behind is `inert`. Without JS the nav links wrap in the header.

## Imagery

| Asset | Status | Limits |
|---|---|---|
| `src/assets/temporary/living-curve-concept.png` | **TEMPORARY.** Cropped from the Design Codex image embedded in the content PDF (sheet 914×1371px; crop 136×546px). Guide lines and labels outside the bottle silhouette were blanked, and the whole crop was given a uniform per-channel tint (≤ 2.5%) so the sheet's warm background `#F3F2F0` becomes exactly mist `#EDEFF0`. The bottle's shape and detail are otherwise unaltered | Sharp only up to about **273px display height** (2× density) or 546px on 1× screens. Place it on `bg-mist` only (on any other background its rectangle shows). It is a concept render of packaging in development, embossed "VIDA" in a serif that is **not** the logo lettering, so it must not be presented as final packaging |

| `src/assets/brand/living-curve-outline.svg` | Decorative hairline motif traced from the outer silhouette of the temporary render (`scripts/brand/bottle_profile.py`; symmetrical, smoothed) | Vector, so it scales freely. Decorative only (`aria-hidden`). It is a silhouette of a concept, not a packaging specification |

**Quality verdict (decision 9):** adequate as a temporary, small-scale image (a small bottle in a large field of negative space works with the brief), but **not adequate** for a large, full-height cinematic hero. A high-resolution, label-free production render (transparent background, at least 2000px tall) is needed before launch.

Do not crop other elements (the hand shot, the optical-behaviour photos, the infographic) from the PDF.

## Asset provenance

The derived brand assets can be regenerated from the PDFs with the dependency-free Python scripts in `scripts/brand/`:

| Script | Produces |
|---|---|
| `pdf_logo_to_svg.py` | `src/assets/brand/vida-logo-lockup.svg`, `vida-wordmark.svg` |
| `make_favicon.py` | `public/favicon.svg` (plus a square variant). The PNG/ICO files were rasterised from the square variant with headless Chrome (512px) and resized with macOS `sips` |
| `pdf_images.py` | Decodes the PDF's embedded images to PNG |
| `clean_bottle.py` | `src/assets/temporary/living-curve-concept.png` from the decoded Design Codex image |
| `bottle_profile.py` | `src/assets/brand/living-curve-outline.svg` from the temporary render |

Run them with `python3 -I <script> …`. Usage is in each file's docstring.

## Domain and metadata

- The production domain is **undecided**. `astro.config.mjs` reads `SITE_URL` from the environment or a git-ignored `.env` (template: `.env.example`). While it's empty, no canonical or `og:url` tags are emitted. Never hard-code or guess a domain. The email domain in the contact details is not the website domain.
- Title pattern: "<Page> | VIDA Specialties Limited" (the homepage uses the name alone).

## Open items for the brand owner

1. Corrected lockup artwork reading "SPECIALTIES", or approval to use the lockup as supplied.
2. Master print colour references (Pantone/CMYK), if they exist.
3. Designer-approved clear-space, minimum-size and print rules to replace the provisional ones above.
4. A high-resolution, label-free Living Curve bottle render.
5. The production domain (`SITE_URL`).
