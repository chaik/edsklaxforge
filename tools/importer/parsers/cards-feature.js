/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature.
 * Base block: cards
 * Source URL: https://chaik.github.io/klaxforge/
 * Generated: 2026-08-10
 *
 * Library convention (cards): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one card:
 *     Cell 1: Image or Icon (mandatory).
 *     Cell 2: Text content — Title (heading) + Description (+ optional CTA).
 *
 * Source structure (div.cf-features-grid):
 *   article.cf-feature-card (x3)
 *     .cf-feature-icon        (decorative icon wrapper)
 *     h3.cf-feature-title
 *     p.cf-feature-description
 */
export default function parse(element, { document }) {
  // Validated against source: direct-child article.cf-feature-card.
  // Fallback selectors handle cross-page variation.
  let cardEls = Array.from(element.querySelectorAll(':scope > article.cf-feature-card'));
  if (!cardEls.length) {
    cardEls = Array.from(element.querySelectorAll('article.cf-feature-card, [class*="feature-card"], :scope > article, :scope > li'));
  }

  // Empty-block guard: bail gracefully if no cards found.
  if (!cardEls.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    // --- Cell 1: icon/image ---
    // Prefer a real image if present; otherwise use the decorative icon wrapper.
    const img = card.querySelector('img, picture');
    const icon = card.querySelector('.cf-feature-icon, [class*="icon"]');
    const imageCell = img || icon || '';

    // --- Cell 2: text content (title + description) ---
    const title = card.querySelector('h3.cf-feature-title, [class*="feature-title"], h2, h3, h4');
    const description = card.querySelector('p.cf-feature-description, [class*="feature-description"], p');
    // Optional CTA at the bottom of the card.
    const ctaLinks = Array.from(card.querySelectorAll('a'));

    const textCell = [];
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    ctaLinks.forEach((cta) => textCell.push(cta));

    // Two-column row: [image/icon, text content]. Keep column count consistent.
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
