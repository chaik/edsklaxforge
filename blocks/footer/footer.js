import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment. Prefer the footer metadata when set; otherwise try
  // the published root path ('/footer', used by the aem.page/aem.live
  // environments) and fall back to '/content/footer' (local dev server layout).
  const footerMeta = getMetadata('footer');
  let fragment = null;
  if (footerMeta) {
    fragment = await loadFragment(new URL(footerMeta, window.location).pathname);
  } else {
    // Prefer the migrated footer under /content (this project keeps content
    // there); fall back to the published root path '/footer' used by the
    // aem.page/aem.live environments.
    fragment = await loadFragment('/content/footer') || await loadFragment('/footer');
  }
  if (!fragment) return;

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Tag the logo (first paragraph) and copyright (last paragraph) so CSS can
  // lay them out as the source does — logo left, copyright right.
  const paragraphs = footer.querySelectorAll('p');
  if (paragraphs.length) {
    paragraphs[0].classList.add('footer-logo');
    paragraphs[paragraphs.length - 1].classList.add('footer-copyright');
  }

  block.append(footer);
}
