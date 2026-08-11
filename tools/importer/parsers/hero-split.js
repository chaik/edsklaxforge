/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-split.
 * Base block: hero
 * Source URL: https://chaik.github.io/klaxforge/
 * Generated: 2026-08-10
 *
 * Library convention (hero): 1 column, 3 rows.
 *   Row 1: block name.
 *   Row 2: Background Image (optional) — single cell.
 *   Row 3: single cell with Title (heading), Subheading, and Call-to-Action.
 *
 * Source structure (section.cf-hero):
 *   .cf-hero-copy
 *     .cf-hero-eyebrow  (eyebrow text)
 *     h1.cf-hero-headline
 *     p.cf-hero-subheadline
 *     .cf-hero-actions
 *       a.cf-cta-primary        (CTA link)
 *       span.cf-hero-price      (inline price copy)
 *   .cf-hero-media
 *     img                        (hero image)
 */
export default function parse(element, { document }) {
  // --- Image (goes in row 2) ---
  // Validated against source: .cf-hero-media img. Fallback to any img.
  const image = element.querySelector('.cf-hero-media img, img');

  // --- Content elements (go in row 3, single cell) ---
  // Eyebrow: small text above the headline. Preserve for completeness.
  const eyebrow = element.querySelector('.cf-hero-eyebrow, [class*="eyebrow"]');
  // Headline: styled as a heading. Validated: h1.cf-hero-headline.
  const headline = element.querySelector('h1.cf-hero-headline, [class*="headline"], h1, h2');
  // Subheadline: supporting paragraph. Validated: p.cf-hero-subheadline.
  const subheadline = element.querySelector('.cf-hero-subheadline, [class*="subheadline"], [class*="subtitle"]');
  // CTA link(s): validated a.cf-cta-primary inside .cf-hero-actions.
  const ctaLinks = Array.from(element.querySelectorAll('.cf-hero-actions a, a.cf-cta-primary, a[class*="cta"]'));
  // Inline price value (e.g. "$100"): prefer the emphasized amount inside the
  // price element (querySelector on a comma-list returns the first match in
  // DOM order, and the wrapper precedes its <strong>, so query the strong
  // first on its own); fall back to the whole price element's text.
  const priceEl = element.querySelector('.cf-hero-price strong')
    || element.querySelector('.cf-hero-price, [class*="price"]');
  const priceValue = priceEl ? priceEl.textContent.trim() : '';

  // Empty-block guard: bail gracefully if no headline and no subheadline.
  if (!headline && !subheadline) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2 — background/hero image (optional).
  if (image) {
    cells.push([image]);
  }

  // Row 3 — single content cell holding all copy.
  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (headline) contentCell.push(headline);
  if (subheadline) contentCell.push(subheadline);
  ctaLinks.forEach((cta) => contentCell.push(cta));
  // Price → nested `price` block (promotional-price box). Label is the promo
  // wording; value comes from the source amount.
  if (priceValue) {
    const priceBlock = WebImporter.Blocks.createBlock(document, {
      name: 'price',
      cells: [['Promotional Price', priceValue]],
    });
    contentCell.push(priceBlock);
  }
  cells.push([contentCell]); // hero is 1-column: one row, one cell holding all elements

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split', cells });
  element.replaceWith(block);
}
