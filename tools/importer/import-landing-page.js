/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroSplitParser from './parsers/hero-split.js';
import cardsFeatureParser from './parsers/cards-feature.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/klaxforge-cleanup.js';
import sectionsTransformer from './transformers/klaxforge-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-split': heroSplitParser,
  'cards-feature': cardsFeatureParser,
};

// TRANSFORMER REGISTRY - Array of transformer functions.
// Cleanup runs first (removes auto-populated header/footer); the section
// transformer then inserts <hr> breaks between the authorable content sections
// using its own DOM selectors (verified against cleaned.html).
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Single-page product landing page for the ClickForge keyboard with header, hero, features grid, configurator, closing CTA, and footer',
  urls: [
    'https://chaik.github.io/klaxforge/',
  ],
  blocks: [
    {
      name: 'hero-split',
      instances: ['.cf-hero'],
    },
    {
      name: 'cards-feature',
      instances: ['.cf-features-grid'],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero',
      selector: 'section.cf-hero',
      style: null,
      blocks: ['hero-split'],
      defaultContent: [],
    },
    {
      id: 'features',
      name: 'Features',
      selector: 'section#features',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: ['.cf-features-heading'],
    },
    {
      id: 'configurator',
      name: 'Configurator',
      selector: 'section#configurator',
      style: 'configurator',
      blocks: [],
      defaultContent: ['#configurator p'],
    },
    {
      id: 'closing-cta',
      name: 'Closing CTA',
      selector: 'section.cf-closing-cta',
      style: 'centered',
      blocks: [],
      defaultContent: ['.cf-closing-cta-heading', '.cf-closing-cta-subheading'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform (typically document.body or main)
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  // Pass PAGE_TEMPLATE to transformers so they can access section information
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Main transformation function (Helix Importer 'one input / multiple outputs')
   */
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    // Skip elements already replaced by a prior parser (detached from DOM).
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // The source hero photo is a client-generated blob: URL with no hosted
    // equivalent, so it cannot survive the import. Repoint any unusable
    // blob:/about: image to the hosted asset committed under content/images/.
    // Selector is container-agnostic: during import the block is a WebImporter
    // <table>, so there is no `.hero-split` element yet — match by src. Runs
    // AFTER adjustImageUrls so the relative path is left intact. See
    // migration-plan.md (hero image note).
    main.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('blob:') || src.startsWith('about:') || src === '') {
        img.setAttribute('src', './images/klaxforge-keyboard.jpg');
      }
    });

    // 6. Generate sanitized path (root/homepage URL maps to /index to avoid the
    //    bundled importer's empty-path `.cwd is not a function` crash).
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
