

"use client";

import { type MotionValue } from "motion/react";
import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useState,
} from "react";

export type ShareState = "idle" | "working" | "copied" | "saved" | "error";

export const shareLabels: Record<ShareState, string> = {
  idle: "SHARE ON X",
  working: "CAPTURING…",
  copied: "COPIED — PASTE ON X",
  saved: "PNG DOWNLOADED",
  error: "COULDN'T CAPTURE",
};

interface UsePassShareOptions {
  stageRef: RefObject<HTMLDivElement | null>;
  username: string;
  flipped: boolean;
  flipProgress: MotionValue<number>;
  tiltXSource: MotionValue<number>;
  tiltYSource: MotionValue<number>;
  revealSource: MotionValue<number>;
}

/**
 * Share/download state machine for the pass. Owns the html-to-image capture:
 * the card is posed flat-front for the snapshot, then restored to its live
 * pose afterwards.
 */
export function usePassShare({
  stageRef,
  username,
  flipped,
  flipProgress,
  tiltXSource,
  tiltYSource,
  revealSource,
}: UsePassShareOptions) {
  const [shareState, setShareState] = useState<ShareState>("idle");

  const capturePass = async (): Promise<Blob | null> => {
    const stage = stageRef.current;
    if (!stage) return null;
    // Capture always shows the identity side: html-to-image cannot render the
    // 3D flip correctly, so the back face is hidden for the snapshot.
    stage.dataset.capturing = "true";
    flipProgress.set(0);
    // Keep the card flat, but fade the ghost logos in partway so the plain
    // stock still shows some foil in the snapshot.
    revealSource.set(0.6);
    await new Promise((resolve) => setTimeout(resolve, 850));

    const { toBlob } = await import("html-to-image");
    // A transparent stand-in keeps one broken image (e.g. a blocked avatar
    // fetch) from rejecting the whole capture.
    const transparentPixel =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    let blob = await toBlob(stage, {
      pixelRatio: 2,
      cacheBust: true,
      imagePlaceholder: transparentPixel,
    }).catch((error) => {
      console.error("[share] capture failed, retrying without images", error);
      return null;
    });
    if (!blob) {
      // Last resort: capture the card without any raster images.
      blob = await toBlob(stage, {
        pixelRatio: 2,
        filter: (node) => (node as HTMLElement).tagName !== "IMG",
      }).catch(() => null);
    }

    delete stage.dataset.capturing;
    flipProgress.set(flipped ? 180 : 0);
    tiltXSource.set(0);
    tiltYSource.set(0);
    revealSource.set(0);
    return blob;
  };

  const downloadPass = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orchestra-pass-${username.slice(1)}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareCard = async (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (shareState === "working") return;
    setShareState("working");
    try {
      const blob = await capturePass();
      if (!blob) throw new Error("capture returned no image");

      const message = `Just got my pass for The Orchestra, AO's online hackathon. Your idea, an army of agents. Aug 12-13, online. aoagents.dev`;

      // Phones only: the native share sheet carries the image straight into
      // the X app, which the web intent URL cannot do. Desktop browsers
      // (e.g. Chrome on Windows) also support navigator.share, but there the
      // OS share sheet is a dead end for X — so desktop always falls through
      // to clipboard + intent URL below.
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const file = new File([blob], `orchestra-pass-${username.slice(1)}.png`, {
        type: "image/png",
      });
      if (isMobile && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: message, title: "The Orchestra" });
        } catch {
          // The user dismissed the share sheet; nothing more to do.
        }
        return;
      }

      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setShareState("copied");
      } catch {
        // Clipboard image writes need permission; fall back to a download.
        downloadPass(blob);
        setShareState("saved");
      }

      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener",
      );
    } catch {
      setShareState("error");
    } finally {
      window.setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const downloadCard = async (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (shareState === "working") return;
    setShareState("working");
    try {
      const blob = await capturePass();
      if (!blob) throw new Error("capture returned no image");
      downloadPass(blob);
      setShareState("saved");
    } catch {
      setShareState("error");
    } finally {
      window.setTimeout(() => setShareState("idle"), 2400);
    }
  };

  return { shareState, shareCard, downloadCard };
}
