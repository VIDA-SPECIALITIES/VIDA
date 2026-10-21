/**
 * The VIDA Collection: per-variant data for the 360° bottle viewer on Our
 * Portfolio. Used by BottleCard.astro (card copy) and src/scripts/bottle-viewer.ts
 * (sleeve labels, cap and sleeve colours).
 *
 * Copy comes from src/data/concepts.ts (approved wording + client additions),
 * so the cards, sleeves and specification section never drift apart.
 *
 * Colours are DESIGN PROPOSALS pending approval (client wrapper spec, 2026-10-21).
 *
 * The client's reference file also carried label descriptors ("HEALTH / LONGEVITY
 * HYDRATION", "CAFFEINE / FOCUS + ACTIVE ENERGY", …), ingredient lists and a
 * "NAFDAC REG. NO.: PENDING" line. Those are claims / regulatory references
 * excluded by the project rules until validated (docs/product/claims-register.md),
 * so they are deliberately NOT here. Add validated label text to `label.extra`.
 */
import { CONCEPTS, type ConceptId } from './concepts';

export type VariantKey = ConceptId;

export interface VidaVariant {
  key: VariantKey;
  index: string;
  /** Short name on the sleeve, e.g. IMMUNE. */
  name: string;
  /** Full name, e.g. VIDA IMMUNE. */
  fullName: string;
  /** Hex colours (design proposals). */
  cap: string;
  sleeve: string;
  sleeveText: string;
  card: {
    /** Approved positioning line. */
    description: string;
    /** Approved concept description. */
    sub: string;
  };
  label: {
    /** Bold descriptor line: the approved positioning line, upper-cased on the sleeve. */
    descriptor: string;
    /** Secondary line: the formulation focus already shown in Concept Specifications. */
    secondary: string;
    /** Optional further lines once validated (ingredients, net content…). Empty until then. */
    extra: string[];
  };
}

const COLOURS: Record<VariantKey, Pick<VidaVariant, 'cap' | 'sleeve' | 'sleeveText'>> = {
  immune: { cap: '#269662', sleeve: '#1F7A52', sleeveText: '#FFFFFF' },
  radiance: { cap: '#C7718F', sleeve: '#EDA2B8', sleeveText: '#3E1626' },
  edge: { cap: '#8A9098', sleeve: '#9CA3AB', sleeveText: '#0E1A2A' },
};

export const VIDA_VARIANTS: VidaVariant[] = CONCEPTS.map((c) => ({
  key: c.id,
  index: c.index,
  name: c.short,
  fullName: c.name,
  ...COLOURS[c.id],
  card: { description: c.line, sub: c.text },
  label: { descriptor: c.line, secondary: c.spec.formulationShort, extra: [] },
}));

export const VIDA_VARIANT_MAP = Object.fromEntries(VIDA_VARIANTS.map((v) => [v.key, v])) as Record<
  VariantKey,
  VidaVariant
>;
