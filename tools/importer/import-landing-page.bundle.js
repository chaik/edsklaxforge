/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-landing-page.js
  var import_landing_page_exports = {};
  __export(import_landing_page_exports, {
    default: () => import_landing_page_default
  });

  // tools/importer/parsers/hero-split.js
  function parse(element, { document }) {
    const image = element.querySelector(".cf-hero-media img, img");
    const eyebrow = element.querySelector('.cf-hero-eyebrow, [class*="eyebrow"]');
    const headline = element.querySelector('h1.cf-hero-headline, [class*="headline"], h1, h2');
    const subheadline = element.querySelector('.cf-hero-subheadline, [class*="subheadline"], [class*="subtitle"]');
    const ctaLinks = Array.from(element.querySelectorAll('.cf-hero-actions a, a.cf-cta-primary, a[class*="cta"]'));
    const priceEl = element.querySelector(".cf-hero-price strong") || element.querySelector('.cf-hero-price, [class*="price"]');
    const priceValue = priceEl ? priceEl.textContent.trim() : "";
    if (!headline && !subheadline) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      cells.push([image]);
    }
    const contentCell = [];
    if (eyebrow) contentCell.push(eyebrow);
    if (headline) contentCell.push(headline);
    if (subheadline) contentCell.push(subheadline);
    ctaLinks.forEach((cta) => contentCell.push(cta));
    if (priceValue) {
      const priceBlock = WebImporter.Blocks.createBlock(document, {
        name: "price",
        cells: [["Promotional Price", priceValue]]
      });
      contentCell.push(priceBlock);
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse2(element, { document }) {
    let cardEls = Array.from(element.querySelectorAll(":scope > article.cf-feature-card"));
    if (!cardEls.length) {
      cardEls = Array.from(element.querySelectorAll('article.cf-feature-card, [class*="feature-card"], :scope > article, :scope > li'));
    }
    if (!cardEls.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector("img, picture");
      const icon = card.querySelector('.cf-feature-icon, [class*="icon"]');
      const imageCell = img || icon || "";
      const title = card.querySelector('h3.cf-feature-title, [class*="feature-title"], h2, h3, h4');
      const description = card.querySelector('p.cf-feature-description, [class*="feature-description"], p');
      const ctaLinks = Array.from(card.querySelectorAll("a"));
      const textCell = [];
      if (title) textCell.push(title);
      if (description) textCell.push(description);
      ctaLinks.forEach((cta) => textCell.push(cta));
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/klaxforge-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript"
      ]);
      const doc = element.ownerDocument;
      element.querySelectorAll("section.cf-closing-cta a").forEach((a) => {
        if (a.closest("strong")) return;
        const strong = doc.createElement("strong");
        a.replaceWith(strong);
        strong.appendChild(a);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cf-header",
        "footer.cf-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link"
      ]);
    }
  }

  // tools/importer/transformers/klaxforge-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var SECTION_SELECTORS = [
    "section.cf-hero",
    "section#features",
    "section#configurator",
    "section.cf-closing-cta"
  ];
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const doc = element.ownerDocument;
      const templateSections = payload && payload.template && Array.isArray(payload.template.sections) && payload.template.sections.length ? payload.template.sections : null;
      let sections;
      if (templateSections) {
        sections = templateSections.map((s) => ({
          el: s && s.selector ? element.querySelector(s.selector) : null,
          style: s ? s.style : void 0
        })).filter((s) => s.el);
      } else {
        sections = SECTION_SELECTORS.map((sel) => ({ el: element.querySelector(sel), style: void 0 })).filter((s) => s.el);
      }
      sections.slice().reverse().forEach((section, revIndex) => {
        const index = sections.length - 1 - revIndex;
        if (section.style) {
          const smBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          section.el.parentNode.insertBefore(smBlock, section.el.nextSibling);
        }
        if (index === 0) return;
        const prev = section.el.previousElementSibling;
        if (!prev) return;
        if (prev.tagName === "HR") return;
        section.el.parentNode.insertBefore(doc.createElement("hr"), section.el);
      });
    }
  }

  // tools/importer/import-landing-page.js
  var parsers = {
    "hero-split": parse,
    "cards-feature": parse2
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "landing-page",
    description: "Single-page product landing page for the ClickForge keyboard with header, hero, features grid, configurator, closing CTA, and footer",
    urls: [
      "https://chaik.github.io/klaxforge/"
    ],
    blocks: [
      {
        name: "hero-split",
        instances: [".cf-hero"]
      },
      {
        name: "cards-feature",
        instances: [".cf-features-grid"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero",
        selector: "section.cf-hero",
        style: null,
        blocks: ["hero-split"],
        defaultContent: []
      },
      {
        id: "features",
        name: "Features",
        selector: "section#features",
        style: null,
        blocks: ["cards-feature"],
        defaultContent: [".cf-features-heading"]
      },
      {
        id: "configurator",
        name: "Configurator",
        selector: "section#configurator",
        style: "configurator",
        blocks: [],
        defaultContent: ["#configurator p"]
      },
      {
        id: "closing-cta",
        name: "Closing CTA",
        selector: "section.cf-closing-cta",
        style: "centered",
        blocks: [],
        defaultContent: [".cf-closing-cta-heading", ".cf-closing-cta-subheading"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_landing_page_default = {
    /**
     * Main transformation function (Helix Importer 'one input / multiple outputs')
     */
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src.startsWith("blob:") || src.startsWith("about:") || src === "") {
          img.setAttribute("src", "./images/klaxforge-keyboard.jpg");
        }
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_landing_page_exports);
})();
