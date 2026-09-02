import assert from "node:assert/strict";
import test from "node:test";

import * as passExport from "../src/lib/pass-export.ts";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { downloadBlob } = passExport;

test("capture readiness waits for active paper shaders", async () => {
  const previousDocument = globalThis.document;
  const previousRaf = globalThis.requestAnimationFrame;
  let frameCount = 0;
  const shader = { dataset: { active: "true", ready: "false" } };
  const root = {
    querySelectorAll(selector) {
      return selector === '[data-testid="paper-shader"]' ? [shader] : [];
    },
  };

  globalThis.document = { fonts: { ready: Promise.resolve() } };
  globalThis.requestAnimationFrame = (callback) => {
    frameCount += 1;
    if (frameCount === 2) shader.dataset.ready = "true";
    callback(performance.now());
    return frameCount;
  };

  try {
    await passExport.waitForCardReadiness(root, { timeoutMs: 1000 });
    assert.equal(frameCount, 3);
  } finally {
    globalThis.document = previousDocument;
    globalThis.requestAnimationFrame = previousRaf;
  }
});

test("capture readiness times out instead of hanging on missing shaders", async () => {
  const previousDocument = globalThis.document;
  const previousRaf = globalThis.requestAnimationFrame;
  const shader = { dataset: { active: "true", ready: "false" } };
  const root = {
    querySelectorAll(selector) {
      return selector === '[data-testid="paper-shader"]' ? [shader] : [];
    },
  };

  globalThis.document = { fonts: { ready: Promise.resolve() } };
  globalThis.requestAnimationFrame = (callback) => {
    setTimeout(() => callback(performance.now()), 1);
    return 1;
  };

  try {
    await passExport.waitForCardReadiness(root, { timeoutMs: 0 });
    assert.equal(shader.dataset.ready, "false");
  } finally {
    globalThis.document = previousDocument;
    globalThis.requestAnimationFrame = previousRaf;
  }
});

test("capture preparation does not resize the visible mobile stage", () => {
  const appended = [];
  const attributes = {};
  const clone = {
    dataset: {},
    style: {},
    setAttribute(name, value) {
      attributes[name] = value;
    },
    querySelectorAll() {
      return [];
    },
  };
  const stage = {
    dataset: {},
    cloneNode() {
      return clone;
    },
    querySelectorAll() {
      return [];
    },
    ownerDocument: {
      body: {
        appendChild(node) {
          appended.push(node);
        },
      },
    },
  };

  const createCaptureTarget = passExport.createCaptureTarget;
  assert.equal(typeof createCaptureTarget, "function");
  const captureTarget = createCaptureTarget(stage);

  assert.equal(captureTarget, clone);
  assert.equal(stage.dataset.capturing, undefined);
  assert.equal(clone.dataset.capturing, "true");
  assert.equal(clone.style.position, "fixed");
  assert.equal(clone.style.left, "-10000px");
  assert.equal(attributes["aria-hidden"], "true");
  assert.deepEqual(appended, [clone]);
});

test("downloaded passes use the Syndicate event name", () => {
  let clicked = false;
  const link = {
    href: "",
    download: "",
    click() {
      clicked = true;
    },
  };

  const originalDocument = globalThis.document;
  const originalUrl = globalThis.URL;
  globalThis.document = { createElement: () => link };
  globalThis.URL = {
    createObjectURL: () => "blob:syndicate-pass",
    revokeObjectURL: () => {},
  };

  try {
    downloadBlob(new Blob(["pass"]), "@participant");
    assert.equal(link.download, "syndicate-pass-participant.png");
    assert.equal(clicked, true);
  } finally {
    globalThis.document = originalDocument;
    globalThis.URL = originalUrl;
  }
});

test("mobile captures force the desktop pass layout", () => {
  const css = readFileSync(
    join(__dirname, "../src/components/interactive-ao-pass.module.css"),
    "utf8",
  );

  assert.match(css, /\.stage\[data-capturing="true"\]/);
  assert.match(css, /width:\s*860px\s*!important/);
  assert.match(css, /frontCopy\[data-with-photo="true"\]\s+\.identityRow/);
  assert.match(css, /grid-template-columns:\s*auto minmax\(0,\s*1fr\)/);
  assert.match(css, /frontCopy\[data-with-photo="true"\]\s+\.teamLine/);
  assert.match(css, /margin-left:\s*calc\(23cqw \+ 3\.2cqw\)/);
});

test("mobile preview keeps the desktop pass geometry", () => {
  const css = readFileSync(
    join(__dirname, "../src/components/interactive-ao-pass.module.css"),
    "utf8",
  );
  const mobileStart = css.indexOf("@media (max-width: 620px)");
  const mobileCss = css.slice(
    mobileStart,
    css.indexOf("@media (prefers-reduced-motion", mobileStart),
  );

  assert.match(mobileCss, /\.stage\s*\{[\s\S]*?width:\s*min\(430px,\s*calc\(100vw - 72px\)\)/);
  assert.match(mobileCss, /\.frontCopy\s*\{[\s\S]*?padding-left:\s*6\.2%/);
  assert.match(mobileCss, /\.photoFrame\s*\{[\s\S]*?width:\s*23cqw/);
  assert.match(mobileCss, /margin-left:\s*calc\(23cqw \+ 3\.2cqw\)/);
  assert.match(mobileCss, /\.sponsorRow\s*\{[\s\S]*?gap:\s*1\.3cqw 2\.4cqw/);
  assert.match(mobileCss, /\.sponsorRow\s*\{[\s\S]*?margin-top:\s*1\.4cqw/);
  assert.match(mobileCss, /\.sponsorLabel\s*\{[\s\S]*?font-size:\s*clamp\(4px,\s*1\.4cqw,\s*12px\)/);
  assert.match(mobileCss, /\.sponsorLogoDodo\s*\{[\s\S]*?2\.55cqw/);
  assert.match(mobileCss, /\.sponsorLogoNeatlogs\s*\{[\s\S]*?3cqw/);
  assert.match(mobileCss, /\.sponsorChip\s*\{[\s\S]*?9\.6cqw[\s\S]*?3\.1cqw/);
  assert.match(mobileCss, /\.sponsorChipAiGrants\s*\{[\s\S]*?11\.2cqw/);
  assert.match(mobileCss, /\.frontFooter\s*\{[\s\S]*?gap:\s*2cqw/);
  assert.match(mobileCss, /\.backDetails\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*auto\)\)/);
  assert.match(mobileCss, /\.backMeta\s*\{[\s\S]*?padding-left:\s*3cqw[\s\S]*?border-left:\s*1px solid/);
});

test("Maximor is the host logo, not a repeated sponsor logo", () => {
  const faceMarkup = readFileSync(
    join(__dirname, "../src/components/pass-faces.tsx"),
    "utf8",
  );
  const css = readFileSync(
    join(__dirname, "../src/components/interactive-ao-pass.module.css"),
    "utf8",
  );

  assert.match(faceMarkup, /className=\{styles\.hackHostLogoFrame\}/);
  assert.match(faceMarkup, /className=\{styles\.hackHostLogo\}/);
  assert.match(faceMarkup, /src=\{withBasePath\("\/sponsors\/maximor\.svg"\)\}/);
  assert.doesNotMatch(faceMarkup, /sponsorLogoMaximor/);
  assert.match(css, /\.hackName\s*\{[\s\S]*?align-items:\s*flex-end/);
  assert.match(css, /\.hackYear\s*\{[\s\S]*?align-items:\s*flex-end/);
  assert.match(css, /\.hackYear\s*\{[\s\S]*?font-size:\s*clamp\(12px,\s*2\.4cqw,\s*22px\)/);
  assert.match(css, /\.hackHostLogoFrame\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /\.hackHostLogoFrame\s*\{[\s\S]*?align-self:\s*flex-end/);
  assert.match(css, /width:\s*clamp\(93px,\s*20\.4cqw,\s*186px\)/);
  assert.match(css, /\.hackHostLogo\s*\{[\s\S]*?position:\s*absolute/);
  assert.match(css, /opacity:\s*1/);
  assert.doesNotMatch(css, /\.sponsorLogoMaximor/);
});

test("profile photos have an initials fallback for failed image loads", () => {
  const faceMarkup = readFileSync(
    join(__dirname, "../src/components/pass-faces.tsx"),
    "utf8",
  );
  const css = readFileSync(
    join(__dirname, "../src/components/interactive-ao-pass.module.css"),
    "utf8",
  );

  assert.match(faceMarkup, /className=\{styles\.photoFallback\}/);
  assert.match(faceMarkup, /aria-hidden="true"/);
  assert.match(faceMarkup, /onLoad=\{\(\) => setPhotoLoaded\(true\)\}/);
  assert.match(css, /\.photoFallback\s*\{/);
  assert.match(css, /\.photoImg\[data-loaded="false"\]/);
  assert.match(css, /\.photoImg\[data-loaded="true"\]/);
});

test("sponsor row stays close above the footer divider on export", () => {
  const css = readFileSync(
    join(__dirname, "../src/components/interactive-ao-pass.module.css"),
    "utf8",
  );

  assert.match(css, /\.sponsorRow\s*\{[\s\S]*?margin-top:\s*1\.4cqw/);
  assert.match(css, /\.frontFooter\s*\{[\s\S]*?margin-top:\s*1\.35cqw/);
  assert.match(css, /\.frontFooter\s*\{[\s\S]*?padding-top:\s*1\.35cqw/);
  assert.match(
    css,
    /\.stage\[data-capturing="true"\]\s+\.sponsorRow\s*\{[\s\S]*?margin-top:\s*1\.4cqw/,
  );
  assert.match(
    css,
    /\.stage\[data-capturing="true"\]\s+\.frontFooter\s*\{[\s\S]*?margin-top:\s*1\.35cqw/,
  );
});

test("Maximor keeps the original white brand asset", () => {
  const logo = readFileSync(join(__dirname, "../public/sponsors/maximor.svg"), "utf8");

  assert.match(logo, /viewBox="0 0 983\.7286 332\.49553"/);
  assert.match(logo, /fill:\s*#ffffff/);
});

test("landing header uses an existing AO logo asset", () => {
  const pageMarkup = readFileSync(join(__dirname, "../src/app/page.tsx"), "utf8");

  assert.match(pageMarkup, /withBasePath\("\/favicon\.svg"\)/);
});
