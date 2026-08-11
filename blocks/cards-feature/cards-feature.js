import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div, i) => {
      if (div.querySelector('picture')) {
        div.className = 'cards-feature-card-image';
      } else if (i === 0) {
        /* first cell is the decorative accent icon (empty in the source) */
        div.className = 'cards-feature-card-icon';
        div.setAttribute('aria-hidden', 'true');
      } else {
        div.className = 'cards-feature-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
