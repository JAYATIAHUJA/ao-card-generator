// Client-only capture pipeline for the share/download PNG. A clone of the
// live stage is captured offscreen so export sizing never reflows the visible
// mobile page. Its current canvas frame is retained for the exported card.

export const EXPORT_WIDTH = 1600;
export const EXPORT_HEIGHT = 900;
/** Card width inside the composition; the live stage is scaled up to this. */
const CARD_TARGET_WIDTH = 1161;

// A transparent stand-in keeps one broken image (e.g. a blocked avatar fetch)
// from rejecting the whole capture.
const transparentPixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      try {
        if (!image.complete) await image.decode();
      } catch {
        // A broken image falls back to the placeholder during capture.
      }
    }),
  );
}

// Embedding the webfonts is the slowest part of a capture (html-to-image
// re-fetches and inlines every font file each time); the result is static per
// page load, so it is computed once and reused.
let fontCssPromise: Promise<string | undefined> | null = null;

function getFontCss(root: HTMLElement) {
  if (!fontCssPromise) {
    fontCssPromise = import("html-to-image")
      .then(({ getFontEmbedCSS }) => getFontEmbedCSS(root))
      .catch(() => undefined);
  }
  return fontCssPromise;
}

async function snapshot(
  root: HTMLElement,
  options: { pixelRatio: number },
): Promise<Blob | null> {
  const { toBlob } = await import("html-to-image");
  const fontEmbedCSS = await getFontCss(root);
  let blob = await toBlob(root, {
    pixelRatio: options.pixelRatio,
    imagePlaceholder: transparentPixel,
    fontEmbedCSS,
  }).catch((error) => {
    console.error("[export] capture failed, retrying without images", error);
    return null;
  });
  if (!blob) {
    // Last resort: capture without any raster images.
    blob = await toBlob(root, {
      pixelRatio: options.pixelRatio,
      filter: (node) => (node as HTMLElement).tagName !== "IMG",
      fontEmbedCSS,
    }).catch(() => null);
  }
  return blob;
}

function copyCanvasFrames(source: HTMLElement, target: HTMLElement) {
  const sourceCanvases = Array.from(source.querySelectorAll("canvas"));
  const targetCanvases = Array.from(target.querySelectorAll("canvas"));

  sourceCanvases.forEach((sourceCanvas, index) => {
    const targetCanvas = targetCanvases[index];
    if (!targetCanvas) return;

    targetCanvas.width = sourceCanvas.width;
    targetCanvas.height = sourceCanvas.height;
    try {
      targetCanvas.getContext("2d")?.drawImage(sourceCanvas, 0, 0);
    } catch {
      // Keep the cloned canvas transparent if its source cannot be read.
    }
  });
}

/** Creates a connected export clone without resizing the visible stage. */
export function createCaptureTarget(stage: HTMLElement): HTMLElement {
  const captureTarget = stage.cloneNode(true) as HTMLElement;
  captureTarget.dataset.capturing = "true";
  captureTarget.setAttribute("aria-hidden", "true");
  Object.assign(captureTarget.style, {
    position: "fixed",
    top: "0",
    left: "-10000px",
    pointerEvents: "none",
  });
  stage.ownerDocument.body.appendChild(captureTarget);
  copyCanvasFrames(stage, captureTarget);
  return captureTarget;
}

/**
 * Captures an offscreen clone. Capture-only desktop styles never touch the
 * visible mobile stage, while the exported card keeps its desktop geometry.
 */
export async function captureLiveCard(
  stage: HTMLElement,
): Promise<Blob | null> {
  await document.fonts.ready;
  await waitForImages(stage);
  const captureTarget = createCaptureTarget(stage);
  try {
    await waitForImages(captureTarget);
    // Let the connected clone resolve its desktop capture styles.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return await snapshot(captureTarget, {
      pixelRatio:
        CARD_TARGET_WIDTH / Math.max(1, captureTarget.offsetWidth),
    });
  } finally {
    captureTarget.remove();
  }
}

let wavesCanvas: HTMLCanvasElement | null | undefined;

/**
 * Draws the page backdrop (black base, dot-grid waves, darkening overlay)
 * straight onto the export context — a canvas re-creation of the page's
 * fixed background layers in their "pass shown" state.
 */
async function drawBackdrop(context: CanvasRenderingContext2D) {
  context.fillStyle = "#000000";
  context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  if (wavesCanvas === undefined) {
    // Dynamic so importing this module stays side-effect free outside the
    // browser (the waves module re-renders a WebGL frame of the background).
    const { renderWavesBackgroundCanvas } = await import("./waves-background");
    wavesCanvas = renderWavesBackgroundCanvas(EXPORT_WIDTH, EXPORT_HEIGHT);
  }
  if (wavesCanvas) {
    context.globalAlpha = 0.15;
    context.drawImage(wavesCanvas, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
    context.globalAlpha = 1;
  }

  // Page overlay at its "pass shown" opacity (0.35), pre-multiplied into the
  // stop colors: radial warm vignette + top-to-bottom darkening.
  const cx = EXPORT_WIDTH * 0.5;
  const cy = EXPORT_HEIGHT * 0.42;
  const farthestCorner = Math.hypot(cx, EXPORT_HEIGHT - cy);
  const radial = context.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    farthestCorner * 0.46,
  );
  radial.addColorStop(0, "rgba(112, 37, 31, 0.063)");
  radial.addColorStop(1, "rgba(112, 37, 31, 0)");
  context.fillStyle = radial;
  context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  const linear = context.createLinearGradient(0, 0, 0, EXPORT_HEIGHT);
  linear.addColorStop(0, "rgba(0, 0, 0, 0.042)");
  linear.addColorStop(1, "rgba(0, 0, 0, 0.266)");
  context.fillStyle = linear;
  context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
}

/** Draws backdrop + centered live-card capture onto the export canvas. */
export async function composePassPng(card: Blob): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return null;

  await drawBackdrop(context);

  const cardImage = await createImageBitmap(card);
  context.drawImage(
    cardImage,
    Math.round((EXPORT_WIDTH - cardImage.width) / 2),
    Math.round((EXPORT_HEIGHT - cardImage.height) / 2),
  );

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function downloadBlob(blob: Blob, username: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `syndicate-pass-${username.replace(/^@/, "")}.png`;
  link.click();
  URL.revokeObjectURL(url);
}
