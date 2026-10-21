# Source asset inventory

What the project actually has to build visuals from, at what resolution, and what each asset can faithfully be used for. Last inspected 2026-10-17.

## Supplied source files (`docs/brand-reference/`, read-only)

| File | Content | Quality |
|---|---|---|
| `VIDA BRAND LOGO_261016_153631.pdf` | Page 1: logo lockup (vector paths). Page 2: three palette swatches (vector) | **Vector, exact.** sRGB profile |
| `VIDA Web content.pdf` | 6 pages: typed copy + two embedded raster images | Text is exact; images are low resolution (below) |

No other brand, product or packaging files have been supplied: no master brief file, no original Design Codex file, no 3D/CAD, no renders, no label artwork, and no photography.

## Embedded images in the content PDF

| PDF object | Image | Pixels | Verdict |
|---|---|---|---|
| 14 | **PG-002 Design Codex board** (Artifact 002) | 914 × 1371 (whole board) | Concept reference; usable only for **small** crops (table below) |
| 1 | "Section 4 — Vision, Mission & Institutional Philosophy" infographic | 915 × 610 | Reference only. Its text is not approved (alternate vision), so it must not be shown |

### Elements inside the Codex board (approximate pixel size at source)

| Element | ≈ px at source | Faithful website use |
|---|---|---|
| Artifact 002 main front view | 136 × 546 | **In use** (`src/assets/temporary/living-curve-concept.png`), sharp up to ≈ 273 px tall on 2× screens |
| Signature Collection pair (glass) | ≈ 90 × 410 each, overlapping | Small only. The two bottles overlap and are labelled "Signature Collection", which is not approved copy |
| Evolution 001 / 002 | ≈ 70 × 290 each | Thumbnail only |
| "The bottle breathes" line drawings | ≈ 40 × 145 each | Too small. Our traced vector outline (`living-curve-outline.svg`) serves this purpose |
| Refinement tiles (neck & cap, emboss, base, shoulder, optical signature) | ≈ 150 × 175 each | Thumbnails ≤ 175 px. The embedded text sits inside the tiles, so they need cropping |
| Material duality (PET / glass) | ≈ 85 × 200 each | Thumbnail only. The claims printed beside them need validation |
| Optical behaviour (daylight / sunset / night / desk) | ≈ 88 × 150 each | Thumbnail only |
| Human experience (hand) | ≈ 200 × 225 | Small only |
| Top / bottom view, emboss detail, frost gradient | ≈ 80 × 80 to 95 × 140 | Too small for anything but icons |

**Conclusion:** the board supports a **small, honest** presentation of the bottle concept. It does **not** support a large hero image, a full-bleed photographic section, a gallery, or zoomed detail views. Any of those needs the **original Codex renders** (ideally ≥ 2000 px tall, transparent or neutral background) or new renders.

## Derived assets already in the project

| File | Derived from | Status |
|---|---|---|
| `src/assets/brand/vida-wordmark.svg`, `vida-logo-lockup.svg` | Logo PDF vector paths, 1:1 | Production-quality vector |
| `public/favicon.svg` / `.ico`, `apple-touch-icon.png` | The wordmark's "V" path | Provisional icon |
| `src/assets/temporary/living-curve-concept.png` | Codex main view (crop; background tinted to mist) | **TEMPORARY**, low resolution |
| `src/assets/renders/vida-artifact-002-render.png` | **Client-supplied reference** (2026-10-17): downloaded from the client's reference page `https://vida-3wyefume.manus.space/assets/vida-artifact-002-render.png`. SHA-256 `296baec6…9d40` | **1536 × 2304 px RGBA, transparent background.** Used for the homepage hero. A concept render (AI-generated on the client's Manus page): the emboss "VIDA" is a serif face, not the official wordmark. **Not** production packaging. Rights and usage to be confirmed by the client |
| `src/assets/renders/vida-hero-coastal-bg.png` | Homepage hero **background layer** (2026-10-18), built by `scripts/brand/hero_layers.py` from the client's text-free coastal scene (`docs/brand-reference/client-uploads/coastal-scene-2026-10-18.png`, 1983 × 793). The scene's own AI bottle was removed (inpainting, plus rock/sea texture cloned from beside it). Added: a refraction softening of the background inside the bottle footprint, a frosted-glass lift (lighter, cooler) of the rocks behind the lower body, a very faint wide lift behind the silhouette, a contact shadow and a faint base reflection, all in the background only | 1983 × 793 px, not upscaled. Soft on large Retina screens; a ≥ 3000 px text-free original would improve it. Usage rights to be confirmed |
| `src/assets/renders/vida-artifact-002-glass.png` | Homepage hero **bottle layer**: colour-to-alpha extraction of `vida-artifact-002-render.png` against its studio white (247), so over white it reproduces the client's `bottle.jpeg` (`docs/brand-reference/client-uploads/artifact-002-bottle-2026-10-18.jpg`) with a mean difference of 0.7 grey levels, while clear glass lets the scene show through. Silhouette, cap, neck rings, emboss, frost and base pixels are unaltered in structure; no blur. **Refinement 2026-10-18:** a soft warm rim light (stronger on the sunlit right) and a restrained base-rim highlight are baked into this layer for separation from the scene | **566 × 2237 px**, transparent. Rendered as its own `<img>` with no CSS filter, opacity or blend mode, aspect preserved. Served at ≥ 2× density at all tested widths |
| `src/assets/renders/vida-artifact-002-render-{immune,radiance,edge}.png` | `vida-artifact-002-render.png` with **only the screw cap recoloured** (`scripts/brand/cap_colours.py`, luminance-preserving tint of rows 26–144; ribbing and shading kept, glass untouched). Client request 2026-10-20: IMMUNE green `#236F51`, RADIANCE pink `#D6A0A9`, EDGE grey `#8C9196` | 1536 × 2304 px, transparent. Used on the Our Portfolio collection cards. **Cap colours are design proposals**, not confirmed closure specifications |
| `src/assets/renders/vida-a002-base-{immune,radiance,edge}.png` + `vida-a002-emboss.png` | **360° viewer layers** (2026-10-21, `scripts/brand/rotation_layers.py`): the cap-colour renders with the embossed "VIDA" inpainted out, plus the emboss strokes lifted onto a transparent layer (170 × 480 px). At 0° they recompose the original render | Used on the Our Portfolio collection cards. The rotation is **simulated** from the single front view: valid because the bottle is axially symmetric under fixed lighting (silhouette and highlights stay put; the emboss travels on the surface). No other angles of the bottle exist in the supplied material |
| `src/assets/brand/living-curve-outline.svg` | Traced outer silhouette of the crop above (symmetrical, smoothed) | Decorative vector motif. Not a technical drawing |

Regeneration scripts: `scripts/brand/`.

## Product imagery for the three concepts

| Concept | Supplied imagery | Can it be created faithfully now? |
|---|---|---|
| VIDA IMMUNE | **None** | No |
| VIDA RADIANCE | **None** | No |
| VIDA EDGE | **None** | No |

The only bottle imagery is the **unlabelled** Artifact 002 water bottle. The supplied content says "No need to reveal finished labels yet." Coordinated product visuals need per-product decisions (colour or tint, label or sleeve system, cap colour, liquid colour, naming lock-ups) that are not in the supplied PDFs. Until those decisions are recorded, any product visual must be labelled **concept visualisation** and must not be presented as packaging.

**Provisional colour directions for IMMUNE, RADIANCE and EDGE:** the client reports these were given in the master brief. They are **not present in the repository or in the context available to this project's assistant**, so none are recorded here and none have been invented. When the brief text is supplied, record them in `docs/VIDA-master-brief.md` and in the table below as **design proposals pending approval**.

| Concept | Colour direction | Status |
|---|---|---|
| VIDA IMMUNE | Brand green `#236F51`, tint `#E6EDE8` (from the client's reference page, 2026-10-17) | Design proposal pending approval · in use on Our Portfolio |
| VIDA RADIANCE | Clay-deep `#925E49`, tint `#F3E6E1` (reference shows a terracotta) | Design proposal pending approval · in use on Our Portfolio |
| VIDA EDGE | Blue `#2F5F8F`, tint `#E3E9F2`. **Not in the logo artwork** | Design proposal pending approval · in use on Our Portfolio |

The client's reference page (https://vida-3wyefume.manus.space/our-portfolio) also has three "wrapper mock-up" renders (1536 × 2304). They were **not** used: their printed labels carry claim wording ("Health / Longevity Hydration", "Caffeine / Focus + Active Energy") that is outside the approved copy. Our Portfolio instead shows the Artifact 002 render with an HTML concept label carrying only the product name.

What *can* be shown faithfully today: the concept names, lines and descriptions as typography (as on Our Portfolio now), and the one shared Artifact 002 silhouette as the system's bottle, without implying any product's final appearance.

## Client uploads not used (2026-10-21)

Three wrapped-sleeve renders (IMMUNE / RADIANCE / EDGE, 1024 × 1536 px, black background) and the prompt used to generate them were supplied. They are **not used**: their labels print "HEALTH / LONGEVITY HYDRATION", "CAFFEINE / FOCUS + ACTIVE ENERGY", "COLLAGEN / BEAUTY HYDRATION", full ingredient lists and "NAFDAC REG. NO.: PENDING", which are claims and a regulatory reference the project rules exclude until validated (`docs/product/claims-register.md`). The label artwork is also AI-generated, so its small text is unreliable. Before any wrapped bottle can appear on the site, it needs approved, claim-free label copy.

## Blocker report (updated 2026-10-17)

### Resolved from existing sources

| Item | Where |
|---|---|
| Bottle dimensions, proportions, material cues and annotations: everything visible on the PG-002 board | `docs/bottle-specification.md` (stated values, inferences and conflicts, all sourced to PDF p.2) |
| Brand palette (exact sRGB values) | Logo PDF; `docs/design-system.md` |
| Logo wordmark and lockup as vector | Logo PDF → `src/assets/brand/` |
| Approved copy, contact details, product disclaimer | Content PDF → `docs/approved-content.md`, `src/data/site.ts` |
| Artifact 002 front view for small-scale use | Codex crop (136 × 546 px) |

### Can be progressed now as clearly labelled concepts

| Item | Basis / constraint |
|---|---|
| Bottle-led homepage and Portfolio composition | Existing crop (≤ 273 px tall) plus the traced vector silhouette. Label it "Bottle concept · in development" |
| A "one silhouette, three concepts" system on Our Portfolio | The shared Artifact 002 silhouette with typographic concept names. No invented labels or liquids |
| Product colour directions | As **design proposals pending approval**, once the brief text is available (see above) |
| A proportion diagram from the board's five zones (18 / 23 / 14 / 35 / 10 %) | Internal or design use only. Not for publication until confirmed (claims register) |

### Genuinely requires external artwork, text or technical confirmation

| Item | Why it can't be produced from existing sources |
|---|---|
| **Master brief text** (`docs/VIDA-master-brief.md`) | It was provided in an earlier conversation that this assistant cannot access, and it isn't in the repository. It must be pasted again; it will not be reconstructed |
| High-resolution Artifact 002 renders | **Partly resolved:** a 1536 × 2304 front render was supplied via the client's reference page (homepage hero). Detail, three-quarter and product-family renders are still outstanding; usage rights of the Manus-generated render need client confirmation |
| **Dimensioned technical drawing** | The board's units are undefined and its values conflict (C1–C8 in `docs/bottle-specification.md`). The fill volume is not stated |
| Closure, material, emboss and frost specifications; regulatory and food-contact review | See section D of `docs/bottle-specification.md` |
| ~~Corrected master logo~~ | **Resolved 2026-10-20:** the company name is now VIDA Specialities Limited, which matches the supplied lockup ("SPECIALITIES LIMITED"). No new artwork is needed for the name |
| Approved per-product label and packaging artwork | Not supplied ("No need to reveal finished labels yet") |
