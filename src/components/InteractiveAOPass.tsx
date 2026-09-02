"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "../lib/base-path";
import { getPassIdentity, getTicketId, normalizeXUsername } from "../lib/pass-identity";
import styles from "./interactive-ao-pass.module.css";
import { PassBackFace, PassFrontFace } from "./pass-faces";
import { usePassInteraction, restingMaterial } from "./use-pass-interaction";
import { shareLabels, usePassShare } from "./use-pass-share";

export interface InteractiveAOPassProps {
  name?: string;
  xUsername: string;
  photo?: string;
  passType?: string;
  teamName?: string;
  ticketId?: string;
  eventName?: string;
  date?: string;
  format?: string;
  captureReady?: boolean;
}

export function InteractiveAOPass({
  name,
  xUsername,
  photo,
  passType = "Participant Pass",
  teamName,
  ticketId,
  eventName = "Syndicate",
  date = "Sep 5 - 7",
  format = "Online",
  captureReady = true,
}: InteractiveAOPassProps) {
  const [flipped, setFlipped] = useState(false);
  const username = normalizeXUsername(xUsername);
  const identity = getPassIdentity(name, username);
  const displayTicketId = ticketId?.trim() || getTicketId(username);

  const {
    stageRef,
    reduceMotion,
    hovering,
    animating,
    dragging,
    interactionX,
    interactionY,
    tiltX,
    tiltY,
    flipProgress,
    lift,
    scale,
    handlePointerDown,
    handlePointerMove,
    endOrbit,
    handlePointerLeave,
    handleToggle,
    handleKeyDown,
  } = usePassInteraction({ flipped, setFlipped });

  const identityKey = [username, identity, photo ?? ""].join("|");
  const { shareState, toast, shareCard, downloadCard, autoCopy } = usePassShare({
    stageRef,
    username,
    identityKey,
  });

  // Generate → copy: once the card content is known, render the export PNG
  // and put it on the clipboard. The capture is deferred until the entrance
  // animation has settled so it never competes with it for the main thread.
  // Browsers may refuse a clipboard write this far from the user's click; in
  // that case a notice points at the share button (a fresh gesture, which
  // will succeed).
  const [autoCopyFailed, setAutoCopyFailed] = useState(false);
  const autoCopyRef = useRef(autoCopy);
  autoCopyRef.current = autoCopy;
  useEffect(() => {
    if (!captureReady) return;
    let cancelled = false;
    setAutoCopyFailed(false);
    const timeout = window.setTimeout(() => {
      void autoCopyRef.current().then((copied) => {
        if (!cancelled) setAutoCopyFailed(!copied);
      });
    }, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [captureReady, identityKey]);

  const shader = {
    interactionX,
    interactionY,
    rotation: flipProgress,
  };

  return (
    <div className={styles.shareWrap}>
      <motion.div
        ref={stageRef}
        role="button"
        tabIndex={0}
        className={styles.stage}
        aria-label={flipped ? "Show identity side" : "Show pass details"}
        aria-pressed={flipped}
        data-side={flipped ? "back" : "front"}
        data-hovering={hovering}
        data-animating={animating}
        data-dragging={dragging}
        data-reduced={reduceMotion}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endOrbit}
        onPointerCancel={endOrbit}
        onPointerLeave={handlePointerLeave}
        style={{
          ...restingMaterial,
          rotateX: tiltX,
          rotateY: tiltY,
          "--logo-scatter": `url("${withBasePath("/ao-logo-scatter.svg")}")`,
        } as React.CSSProperties}
      >
        <span className={styles.contactShadow} aria-hidden="true" />

        <motion.span
          className={styles.ticket}
          style={reduceMotion ? undefined : { rotateY: flipProgress, y: lift, scale }}
        >
          <PassFrontFace
            visible={!flipped}
            shader={{ ...shader, active: !flipped || animating }}
            eventName={eventName}
            identity={identity}
            username={username}
            photo={photo}
            teamName={teamName}
            passType={passType}
            date={date}
            format={format}
          />
          <PassBackFace
            visible={flipped}
            shader={{ ...shader, active: flipped || animating }}
            teamName={teamName}
            ticketId={displayTicketId}
          />
        </motion.span>
      </motion.div>

      <div className={styles.shareActions}>
        <button
          type="button"
          className={styles.shareButton}
          onClick={shareCard}
          disabled={!captureReady || shareState === "working"}
        >
          {shareLabels[shareState]}
        </button>
        <button
          type="button"
          className={styles.shareButton}
          onClick={downloadCard}
          disabled={!captureReady || shareState === "working"}
        >
          DOWNLOAD PASS
        </button>
      </div>

      {autoCopyFailed ? (
        <p className={styles.copyNotice} role="status">
          Couldn&apos;t auto-copy — use SHARE ON X to copy your pass.
        </p>
      ) : null}

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={styles.toast}
            data-tone={toast.tone}
            initial={{ opacity: 0, x: "-50%", y: 8, scale: 0.96 }}
            animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
