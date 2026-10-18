/**
 * VIDA product concepts: single source for Our Portfolio (collection cards and
 * the Concept Specifications section).
 *
 * Sources: docs/brand-reference/VIDA Web content.pdf p.4 (names, lines,
 * descriptions) and the client's specification brief of 2026-10-18 (concept
 * direction, formulation focus, intended positioning). These are proposed
 * product directions, NOT finalised formulations or proven benefits. Do not add
 * quantities, nutrition values or benefit claims here without validation
 * (docs/product/claims-register.md).
 */

export type ConceptId = 'immune' | 'radiance' | 'edge';

export interface Concept {
  id: ConceptId;
  index: string;
  /** Short name used on labels, e.g. IMMUNE. */
  short: string;
  name: string;
  /** Approved positioning line. */
  line: string;
  /** Approved description. */
  text: string;
  spec: {
    /** Short direction, e.g. "Everyday hydration". */
    direction: string;
    /** Longer concept type for the concept card. */
    type: string;
    /** Formulation focus as stated on the concept card. */
    formulation: string;
    /** Compact formulation focus for the comparison table. */
    formulationShort: string;
    /** Intended positioning (card). */
    positioning: string;
    /** Intended positioning (table). */
    positioningShort: string;
    /** True when the source names no ingredients yet. */
    formulationPending?: boolean;
  };
}

export const CONCEPTS: Concept[] = [
  {
    id: 'immune',
    index: '01',
    short: 'IMMUNE',
    name: 'VIDA IMMUNE',
    line: 'Everyday hydration. Purposefully supported.',
    text: 'A functional hydration concept being developed around essential electrolytes and selected micronutrients for everyday wellness.',
    spec: {
      direction: 'Everyday hydration',
      type: 'Functional hydration',
      formulation: 'Essential electrolytes and selected micronutrients.',
      formulationShort: 'Electrolytes and selected micronutrients',
      positioning: 'Everyday wellness',
      positioningShort: 'Everyday wellness',
    },
  },
  {
    id: 'radiance',
    index: '02',
    short: 'RADIANCE',
    name: 'VIDA RADIANCE',
    line: 'Hydration meets modern beauty wellness.',
    text: 'A sophisticated hydration concept being developed around carefully selected nutritional ingredients, including collagen peptides, hyaluronic acid and vitamin C.',
    spec: {
      direction: 'Beauty-led hydration',
      type: 'Hydration with nutritional ingredients',
      formulation: 'Collagen peptides, hyaluronic acid and vitamin C are being explored.',
      formulationShort: 'Collagen peptides, hyaluronic acid and vitamin C under consideration',
      positioning: 'Modern beauty and wellness',
      positioningShort: 'Modern beauty and wellness',
    },
  },
  {
    id: 'edge',
    index: '03',
    short: 'EDGE',
    name: 'VIDA EDGE',
    line: 'Hydration for the working mind.',
    text: 'A performance-oriented hydration concept designed for the rhythm of modern professional life.',
    spec: {
      direction: 'Performance-oriented hydration',
      type: 'Performance-oriented hydration',
      formulation: 'In development.',
      formulationShort: 'In development',
      positioning: 'The rhythm of modern professional life',
      positioningShort: 'Professional lifestyle',
      formulationPending: true,
    },
  },
];

/** Shared foundation for all three concepts. */
export const CONCEPT_FOUNDATION = [
  { label: 'Water standard', value: 'VIDA Base Water Standard' },
  { label: 'Bottle platform', value: 'Artifact 002 — The Living Curve Refined' },
  { label: 'Development stage', value: 'Concepts under development' },
] as const;

export const CONCEPT_SPEC_DISCLAIMER =
  'VIDA IMMUNE, VIDA RADIANCE and VIDA EDGE are concepts under development. Final formulations, ingredient quantities, nutritional information, product specifications, availability and permitted claims remain subject to technical validation and applicable regulatory requirements.';

/** Per-concept accent classes (design proposals pending approval). */
export const CONCEPT_TONES: Record<ConceptId, { text: string; bg: string; border: string; tint: string }> = {
  immune: { text: 'text-green', bg: 'bg-green', border: 'border-green', tint: 'bg-immune-tint' },
  radiance: { text: 'text-clay-deep', bg: 'bg-clay-deep', border: 'border-clay-deep', tint: 'bg-radiance-tint' },
  edge: { text: 'text-edge', bg: 'bg-edge', border: 'border-edge', tint: 'bg-edge-tint' },
};
