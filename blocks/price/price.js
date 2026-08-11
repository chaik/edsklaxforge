/**
 * price — a compact promotional-price box.
 *
 * Authored/imported structure (one row, two cells):
 *   | price |
 *   | Promotional Price | $100 |
 * i.e. after decoration the block is:
 *   <div class="price block"><div><div>Promotional Price</div><div>$100</div></div></div>
 *
 * decorate() reads the label (first cell) and value (last cell) and rebuilds
 * the block as a single inline box: a small uppercase label followed by the
 * bold price value. Text lives in content — this only restyles it.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const labelText = cells[0] ? cells[0].textContent.trim() : '';
  const valueText = cells[cells.length - 1] ? cells[cells.length - 1].textContent.trim() : '';

  block.textContent = '';

  if (labelText) {
    const label = document.createElement('span');
    label.className = 'price-label';
    label.textContent = labelText;
    block.append(label);
  }

  if (valueText) {
    const value = document.createElement('span');
    value.className = 'price-value';
    value.textContent = valueText;
    block.append(value);
  }
}
