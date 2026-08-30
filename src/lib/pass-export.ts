// Client-only capture pipeline for the share/download PNG. The card is
// captured from the LIVE, on-screen stage (so the PNG shows exactly what the
// user sees — current shader frame, light and foil included) and composited
// over a backdrop (base color + waves + overlay) drawn straight onto the
// export canvas — no hidden DOM capture needed.

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

// Captures can overlap (auto-copy on mount vs. a user click). The pin flag is
// reference-counted so the first capture to finish cannot un-pin the stage
// while another capture is still cloning it — that race used to produce PNGs
// of the mirrored back face.
let captureDepth = 0;

/**
 * Captures the live card as it currently appears. The `data-capturing` CSS
 * pins the stage flat on its front face with `!important` transforms while
 * the snapshot runs, so no animation state has to be reset or restored.
 */
export async function captureLiveCard(
  stage: HTMLElement,
): Promise<Blob | null> {
  await document.fonts.ready;
  await waitForImages(stage);
  stage.dataset.capturing = "true";
  captureDepth += 1;
  try {
    // Let the pinning styles apply before cloning.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return await snapshot(stage, {
      pixelRatio: CARD_TARGET_WIDTH / Math.max(1, stage.offsetWidth),
    });
  } finally {
    captureDepth -= 1;
    if (captureDepth === 0) delete stage.dataset.capturing;
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
