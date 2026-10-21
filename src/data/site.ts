/**
 * Approved, reusable site facts. Source: docs/brand-reference/VIDA Web content.pdf
 * (transcribed in docs/approved-content.md).
 *
 * Every value here must trace back to approved content. Do not add facts,
 * claims, certifications or partners that are not in the approved source.
 */

/**
 * Search-engine indexing switch. Keep false until the client approves the site
 * for launch: every page then carries `noindex, nofollow` and robots.txt
 * disallows crawling. Flip to true (and set SITE_URL) at launch.
 */
export const INDEXING_APPROVED = false;

/** Confirmed by the client 2026-10-20 (supersedes the 2026-10-17 spelling; see docs/approved-content.md). Use everywhere in text and metadata. */
export const COMPANY_NAME = 'VIDA Specialities Limited';
export const BRAND_NAME = 'VIDA';

/** Approved vision: the typed text in the content PDF (not the infographic variant). */
export const VISION =
  "To become one of Africa's most respected wellness beverage companies, recognized globally for products built on trust, craftsmanship and evidence-led innovation.";
export const MISSION =
  'To engineer premium wellness beverages that consistently improve everyday experiences through thoughtful formulation, disciplined manufacturing and enduring customer trust.';
export const PURPOSE = 'We honour life by elevating the everyday';

/**
 * Approved contact details, verbatim. The email domain is part of the approved
 * address and is NOT the website domain (see SITE_URL in astro.config.mjs).
 */
export const CONTACT = {
  addressLines: ['No. 44 Khartoum Street', 'Wuse Zone 5', 'Abuja, FCT', 'Nigeria'],
  email: 'hello@vidaspecialities.com',
  partnershipEmail: 'hello@vidaspecialities.com',
  telephone: { display: '+234 803 332 2188', href: 'tel:+2348033322188' },
  whatsapp: { display: '+234 809 332 2188', href: 'https://wa.me/2348093322188' },
} as const;

/** Approved navigation order. Paths are proposed. */
export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Our Story', href: '/our-story/' },
  { label: 'Our Philosophy', href: '/our-philosophy/' },
  { label: 'Our Portfolio', href: '/our-portfolio/' },
  { label: 'Partnerships', href: '/partnerships/' },
  { label: 'Contact', href: '/contact/' },
] as const;

/** Must accompany any presentation of VIDA products. Verbatim — do not edit. */
export const PRODUCT_DISCLAIMER =
  'Products shown are currently under development. Final formulations, specifications, availability and permitted claims are subject to technical validation and applicable regulatory approvals.';

export const DEFAULT_DESCRIPTION =
  'VIDA Specialities Limited is building a new generation of hydration products from Africa—combining exceptional water, purposeful nutrition, disciplined science and considered design.';
