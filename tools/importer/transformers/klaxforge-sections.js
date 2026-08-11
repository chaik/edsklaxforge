/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: klaxforge (ClickForge) section breaks.
 *
 * The landing page has four authorable content sections that must become
 * distinct EDS sections separated by <hr> section breaks. Boundaries verified
 * against migration-work/cleaned.html (direct children of div.cf-page,
 * excluding the auto-populated header/footer removed by klaxforge-cleanup.js):
 *
 *   1. section.cf-hero            -> hero-split block
 *   2. section#features           -> heading + cards-feature block
 *   3. section#configurator       -> default-content placeholder
 *   4. section.cf-closing-cta     -> default-content closing CTA
 *
 * Expected result: 3 <hr> section breaks (one before each non-first section).
 *
 * No Section Metadata blocks are emitted: authoring-analysis.json marks every
 * section keep:false (the near-black background is a page-global theme applied
 * in styles.css, not a per-section container color; the configurator dashed box
 * is decorative CSS). If a future template defines section.style values, the
 * payload.template.sections branch below emits Section Metadata for them.
 *
 * Runs in beforeTransform: the hero-split parser replaces the entire
 * section.cf-hero element with the hero block, so by afterTransform that
 * section root no longer exists to anchor a break — features would wrongly
 * become the first section and lose its preceding break. Inserting the <hr>
 * breaks (and any Section Metadata) before parsing — while all four original
 * section roots are intact — keeps them as siblings that survive parser
 * replacement and header/footer cleanup.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Ordered content-section selectors verified in migration-work/cleaned.html.
const SECTION_SELECTORS = [
  'section.cf-hero',
  'section#features',
  'section#configurator',
  'section.cf-closing-cta',
];

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const doc = element.ownerDocument;

    // Prefer template-driven section descriptors when page-templates.json
    // defines them (enables reuse across templates); otherwise fall back to the
    // DOM-verified content-section selectors above.
    const templateSections = payload
      && payload.template
      && Array.isArray(payload.template.sections)
      && payload.template.sections.length
      ? payload.template.sections
      : null;

    // Resolve ordered { el, style } descriptors for each section root.
    let sections;
    if (templateSections) {
      sections = templateSections
        .map((s) => ({
          el: s && s.selector ? element.querySelector(s.selector) : null,
          style: s ? s.style : undefined,
        }))
        .filter((s) => s.el);
    } else {
      sections = SECTION_SELECTORS
        .map((sel) => ({ el: element.querySelector(sel), style: undefined }))
        .filter((s) => s.el);
    }

    // Process in reverse so inserts/appends don't disturb earlier indices.
    sections.slice().reverse().forEach((section, revIndex) => {
      const index = sections.length - 1 - revIndex;

      // Section Metadata block (only when this section defines a style).
      if (section.style) {
        const smBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        section.el.parentNode.insertBefore(smBlock, section.el.nextSibling);
      }

      // Section break: an <hr> before every non-first section that has
      // preceding content and is not already preceded by an <hr>.
      if (index === 0) return;
      const prev = section.el.previousElementSibling;
      if (!prev) return;
      if (prev.tagName === 'HR') return;
      section.el.parentNode.insertBefore(doc.createElement('hr'), section.el);
    });
  }
}
