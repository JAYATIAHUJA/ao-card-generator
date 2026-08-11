"use client";

import { motion } from "motion/react";
import { useState } from "react";
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
}

export function InteractiveAOPass({
  name,
  xUsername,
  photo,
  passType = "Participant Pass",
  teamName,
  ticketId,
  eventName = "The Orchestra",
  date = "Aug 12–13",
  format = "Online",
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
    tiltXSource,
    tiltYSource,
    flipProgress,
    lift,
    scale,
    revealSource,
    handlePointerDown,
    handlePointerMove,
    endOrbit,
    handlePointerLeave,
    handleToggle,
    handleKeyDown,
  } = usePassInteraction({ flipped, setFlipped });

  const { shareState, shareCard, downloadCard } = usePassShare({
    stageRef,
    username,
    flipped,
    flipProgress,
    tiltXSource,
    tiltYSource,
    revealSource,
  });

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
        style={{ ...restingMaterial, rotateX: tiltX, rotateY: tiltY }}
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
          disabled={shareState === "working"}
        >
          {shareLabels[shareState]}
        </button>
        <button
          type="button"
          className={styles.shareButton}
          onClick={downloadCard}
          disabled={shareState === "working"}
        >
          DOWNLOAD PASS
        </button>
      </div>
    </div>
  );
}
