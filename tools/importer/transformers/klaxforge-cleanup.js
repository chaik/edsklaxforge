/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: klaxforge (ClickForge) site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content (hero, features, configurator placeholder, closing CTA).
 *
 * All selectors verified against migration-work/cleaned.html:
 *   #dc-root > div.sc-host > div.cf-page
 *     > header.cf-header  (site header + nav.cf-nav)  -> auto-populated, remove
 *     > section.cf-hero
 *     > section#features.cf-features
 *     > section#configurator.configurator-hook
 *     > section.cf-closing-cta
 *     > footer.cf-footer  (site footer)               -> auto-populated, remove
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // No cookie banners / modals / overlays present in the captured DOM.
    // Defensive removal of non-authorable, non-content elements that never
    // survive into an authored page. DOMUtils.remove is a no-op when absent.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
    ]);

    // The closing CTA link renders as a filled (primary) button in the source.
    // EDS buttonizes a link only when its text is bold, so wrap the closing
    // CTA anchor in <strong> — decorateButtons() then promotes it to a primary
    // (orange) button. The hero CTA is handled separately by hero-split.js.
    const doc = element.ownerDocument;
    element.querySelectorAll('section.cf-closing-cta a').forEach((a) => {
      if (a.closest('strong')) return;
      const strong = doc.createElement('strong');
      a.replaceWith(strong);
      strong.appendChild(a);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (verified in captured DOM):
    //  - header.cf-header: site header / nav (auto-populated by EDS header block)
    //  - footer.cf-footer: site footer (auto-populated by EDS footer block)
    WebImporter.DOMUtils.remove(element, [
      'header.cf-header',
      'footer.cf-footer',
    ]);

    // Safe leftover element cleanup (present-if-any; no-op otherwise).
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
    ]);
  }
}
