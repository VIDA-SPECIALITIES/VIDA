# Content and claim validation register

Every statement on the site, or in the supplied sources, that could be read as a factual, product, health, environmental or technical claim, with its status. Use it before adding or changing copy.

Status key:
- **APPROVED COPY**: in the client's typed content (`docs/approved-content.md`). The wording is approved, but that is not proof that the underlying fact is substantiated.
- **BRAND LANGUAGE**: aspirational or design language with no factual claim. Low risk.
- **CONFIRM-TECH**: needs technical, supplier or quality evidence before it can be stated as fact.
- **CONFIRM-REG**: needs regulatory review (e.g. NAFDAC rules on food and beverage advertising and claims) before public or commercial use.
- **NOT FOR USE**: appears in a source but is not approved for the website.

This register flags risk. It is not legal or regulatory advice.

## On the website now

| Statement (where) | Status | Notes |
|---|---|---|
| Vision: "…most respected wellness beverage companies, recognized globally…" (Our Story) | APPROVED COPY · BRAND LANGUAGE | Aspiration, framed as "to become" |
| Mission: "To engineer premium wellness beverages that consistently improve everyday experiences…" | APPROVED COPY · BRAND LANGUAGE | |
| "building a new generation of hydration products from Africa—combining exceptional water, purposeful nutrition, disciplined science and considered design" (Home) | APPROVED COPY · CONFIRM-TECH (soft) | "Exceptional water" is qualitative |
| "VIDA was founded in Nigeria…" / "a Nigerian consumer wellness company focused on premium hydration and functional beverages" | APPROVED COPY | Company fact supplied by the client |
| "Nigeria is home to one of the world's largest and most dynamic consumer populations." | APPROVED COPY · CONFIRM-TECH (soft) | A general market statement; fine as written, but avoid adding statistics without a cited source |
| Principles: "Purity, consistency and sensory quality form the foundation…" | APPROVED COPY · BRAND LANGUAGE | Principle, not a test result |
| "VIDA will never make a claim stronger than its evidence." | APPROVED COPY | **Governs this register** |
| VIDA IMMUNE: "Everyday hydration. Purposefully supported." / "…being developed around essential electrolytes and selected micronutrients for everyday wellness." | APPROVED COPY · **CONFIRM-REG** | The **product name "IMMUNE" may itself be read as an implied immune-health claim.** Keep "concept / being developed" framing and the disclaimer. Regulatory review of the name is recommended before launch or commercial use |
| VIDA RADIANCE: "Hydration meets modern beauty wellness." / "…including collagen peptides, hyaluronic acid and vitamin C." | APPROVED COPY · **CONFIRM-REG** · CONFIRM-TECH | Ingredient statements describe a formulation **in development**. Any beauty or skin benefit claim would need substantiation; none is made. Don't add one |
| VIDA EDGE: "Hydration for the working mind." / "performance-oriented hydration concept…" | APPROVED COPY · **CONFIRM-REG** | Implies a cognitive or performance angle. Keep it as concept positioning. Don't add energy, focus or performance claims |
| VIDA EDGE formulation: "…being developed around coconut water with natural caffeine and other minerals." (Our Portfolio card, Concept Specifications) | **CLIENT-SUPPLIED (2026-10-20)** · CONFIRM-TECH · **CONFIRM-REG** | An ingredient direction, framed as "being developed". Caffeine content normally carries labelling and advisory requirements (e.g. NAFDAC rules and statements for children and pregnancy) before any product use. Don't add caffeine amounts or energy, focus or alertness benefits, and don't name specific minerals until confirmed |
| Base Water Standard: "water engineered for purity, consistency and exceptional drinking quality" | APPROVED COPY · CONFIRM-TECH | Needs a defined water specification and QA evidence before being presented as a standard in force |
| Product disclaimer: "Products shown are currently under development…" | APPROVED COPY | **Mandatory** wherever the products appear |
| Partnerships: "developing an international network of specialist partners…" | APPROVED COPY | Describes intent. **Never name partners** or imply that existing partnerships are signed |
| Homepage hero: "Signature Collection — Ultra-clear glass · Subtle frost · Vertical emboss" + "Concept in development" + "Artifact 002 / The Living Curve Refined" | **CLIENT-REQUESTED (2026-10-17)** · CONFIRM-TECH | Shown at the client's explicit request as **design intent of a concept**, always with "Concept in development". "Ultra-clear glass" and "subtle frost" are not yet confirmed material specifications. Don't extend them into claims such as "low-iron", "recyclable" or "premium glass" |
| "Bottle concept · in development" (caption, Our Portfolio) | Interface label | Correct framing for the temporary render |
| Contact details | APPROVED COPY | Exact values in `src/data/site.ts` |

## On the client's reference page (manus.space) but **not** used

| Statement | Status | Why |
|---|---|---|
| IMMUNE: "Health & Longevity", "Health / Longevity Hydration", "Purposeful everyday hydration for a health-conscious life." | NOT FOR USE · CONFIRM-REG | Longevity/health claims; standing instruction forbids unvalidated health or longevity claims |
| RADIANCE: "Beauty & Women", "Collagen / Beauty Hydration", "A collagen-led beauty hydration concept designed with women in mind." | NOT FOR USE · CONFIRM-REG | Beauty-benefit framing and target-audience wording not in approved copy |
| EDGE: "Focus & Active Life", "Caffeine / Focus + Active Energy", "Caffeine-led hydration for productivity, energy, and physically active modern lives." | NOT FOR USE · CONFIRM-REG · CONFIRM-TECH | Energy/focus claims stay out. (Caffeine itself is now a client-supplied ingredient direction, see the EDGE formulation row; the claim wording here is still not used) |
| Wrapper mock-up images (labels print the above) | NOT FOR USE | Same wording appears on the labels |

## Wrapped-sleeve renders supplied 2026-10-21 (not used)

| Statement (on the label) | Status | Why |
|---|---|---|
| IMMUNE: "HEALTH / LONGEVITY HYDRATION" | NOT FOR USE · CONFIRM-REG | Health/longevity claim |
| RADIANCE: "COLLAGEN / BEAUTY HYDRATION" | NOT FOR USE · CONFIRM-REG | Beauty-benefit framing |
| EDGE: "CAFFEINE / FOCUS + ACTIVE ENERGY", "PRODUCTIVITY + ACTIVE LIFE" | NOT FOR USE · CONFIRM-REG | Energy/focus/productivity claims |
| "NAFDAC REG. NO.: PENDING (A1-XXXX)" | NOT FOR USE | Regulatory reference; implies an application is in progress |
| Ingredient lists (e.g. "sodium, potassium, magnesium", "Purified water, caffeine, natural flavour") | NOT FOR USE · CONFIRM-TECH | Not in approved copy; EDGE's list also contradicts the client's coconut-water direction (2026-10-20) |

## In supplied sources but **not** on the website

| Statement (source) | Status | Why it isn't used |
|---|---|---|
| Infographic vision/mission ("premium hydration company… scientific integrity…") | NOT FOR USE | Decision 3: typed vision only |
| Infographic: "Sustainable sourcing", "Conscious manufacturing", "Responsible sourcing" | NOT FOR USE · CONFIRM-TECH · CONFIRM-REG | Environmental claims without evidence |
| Infographic: "Designed in Nigeria. Positioned for Africa. Built for the world." | NOT FOR USE (not typed copy) | Close to approved wording, but not approved |
| Codex: "Highly Recyclable" (PET) | NOT FOR USE · CONFIRM-TECH | Environmental claim; depends on the resin and on local recycling |
| Codex: "Low-iron glass" | NOT FOR USE · CONFIRM-TECH | Material specification not confirmed |
| Codex: "Ultra-clear", "Subtly frosted" | Used on the homepage **only** as concept design intent (client request 2026-10-17) · CONFIRM-TECH | See the homepage hero row above |
| Codex: "Signature Collection (glass)" | Used on the homepage at the client's request (2026-10-17) | The name is client-requested; it remains a concept, not a product line on sale |
| Codex: "Everyday Collection (PET)" | NOT FOR USE | Not requested |
| Codex: dimensions (7.5 / 2.25 units, 0.6 mm emboss, etc.) | NOT FOR USE · CONFIRM-TECH | Undefined units; internal conflicts (see `docs/bottle-specification.md`) |
| Codex: "Forged by water. Crafted for living." / "The quieter the design, the louder the craftsmanship." | NOT FOR USE (pending approval) | Taglines from the board, not typed copy. They could be proposed to the client |
| Codex: "Balanced in the hand. Effortless to hold." | NOT FOR USE · CONFIRM-TECH | Ergonomic claims about an unmade bottle |

## Rules for new copy

1. New wording goes into `docs/approved-content.md` (or its interface-labels table) **before** it ships.
2. No health, beauty, immunity, longevity, energy, focus, cognitive or performance benefit claims.
3. No "available", "buy", "launching", prices or stockists. The products are concepts under development.
4. No certifications, test results, sustainability claims or partner names without evidence recorded here.
