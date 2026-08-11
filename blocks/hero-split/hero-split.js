import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

/**
 * hero-split — split product hero: copy column + product photo.
 * Decorated DOM (from .plain.html) is two rows:
 *   row 1: a cell containing <picture><img> (the product image)
 *   row 2: a cell containing eyebrow <p>, <h1>, subheadline <p>,
 *          CTA <p><a>, and a nested `price` block (promotional-price box)
 * This decorate() tags the columns, promotes the CTA link to a button so it
 * reuses the global button styling, and loads the nested price block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [media, copy] = [...block.children];

  if (media) {
    media.classList.add('hero-split-media');
    // This hero photo is the LCP image — load it eagerly, not lazily.
    const img = media.querySelector('img');
    if (img) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    }
  }
  if (!copy) return;

  copy.classList.add('hero-split-copy');
  const cell = copy.querySelector(':scope > div') || copy;

  // Eyebrow: the first paragraph, sitting above the headline.
  const first = cell.firstElementChild;
  if (first && first.tagName === 'P') first.classList.add('hero-split-eyebrow');

  // CTA: reuse the global .button styling for the call-to-action link.
  const link = cell.querySelector('a');
  const ctaP = link ? link.closest('p') : null;
  if (link) {
    link.classList.add('button');
    if (ctaP) ctaP.classList.add('hero-split-cta');
  }

  // Nested price block. The importer emits the price as a <table> inside this
  // content cell; EDS only auto-converts section-level tables to blocks, so
  // convert it here: read the label/value cells, rebuild as a `.price` block,
  // then decorate + load it (decorateBlocks only handles top-level blocks).
  let priceBlock = null;
  const priceTable = cell.querySelector('table');
  if (priceTable) {
    const dataRow = priceTable.querySelector('tr:last-child');
    const values = dataRow ? [...dataRow.children].map((td) => td.textContent.trim()) : [];
    if (values.length) {
      priceBlock = buildBlock('price', [values]);
      priceTable.replaceWith(priceBlock);
      decorateBlock(priceBlock);
      await loadBlock(priceBlock);
    }
  }

  // Group the CTA and the price on a single row, matching the source layout.
  if (ctaP && priceBlock) {
    const actions = document.createElement('div');
    actions.className = 'hero-split-actions';
    ctaP.replaceWith(actions);
    actions.append(ctaP, priceBlock);
  }
}
