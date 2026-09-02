"use client";

import { type MotionValue } from "motion/react";
import { useState } from "react";
import { withBasePath } from "../lib/base-path";
import styles from "./interactive-ao-pass.module.css";
import { PaperShader } from "./PaperShader";

interface ShaderLayerProps {
  active: boolean;
  interactionX: MotionValue<number>;
  interactionY: MotionValue<number>;
  rotation: MotionValue<number>;
}

function ShaderLayer({
  active,
  interactionX,
  interactionY,
  rotation,
}: ShaderLayerProps) {
  return (
    <PaperShader
      active={active}
      interactionX={interactionX}
      interactionY={interactionY}
      rotation={rotation}
    />
  );
}

function PassStub() {
  return (
    <aside className={styles.stub}>
      <span className={styles.stubBarcode} aria-hidden="true" />
      <span className={styles.stubYear} aria-hidden="true">
        2026
      </span>
      <span className={styles.stubText} aria-hidden="true">
        ADMIT ONE
      </span>
    </aside>
  );
}

function PassNotches() {
  return (
    <>
      <span className={`${styles.notch} ${styles.notchLeft}`} aria-hidden="true" />
      <span className={`${styles.notch} ${styles.notchRight}`} aria-hidden="true" />
      <span className={`${styles.notchSmall} ${styles.notchTop}`} aria-hidden="true" />
      <span className={`${styles.notchSmall} ${styles.notchBottom}`} aria-hidden="true" />
    </>
  );
}

interface PassFrontFaceProps {
  visible: boolean;
  shader: ShaderLayerProps;
  eventName: string;
  identity: string;
  username: string;
  photo?: string;
  teamName?: string;
  passType: string;
  date: string;
  format: string;
}

export function PassFrontFace({
  visible,
  shader,
  eventName,
  identity,
  username,
  photo,
  teamName,
  passType,
  date,
  format,
}: PassFrontFaceProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(photo) && !photoFailed;

  return (
    <section
      className={`${styles.face} ${styles.front}`}
      aria-hidden={!visible}
      data-active={visible}
    >
      <ShaderLayer {...shader} />
      <span className={styles.logoField} aria-hidden="true" />
      <span className={styles.shineSweep} aria-hidden="true" />
      <div className={styles.frontCopy} data-with-photo={showPhoto ? "true" : "false"}>
        <div className={styles.eyebrowGroup}>
          <p className={styles.eyebrow}>AO HACKATHON</p>
          <p className={styles.hackName}>
            {eventName.toUpperCase()}
            <span className={styles.hackYear}>
              · BY
              <span className={styles.hackHostLogoFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.hackHostLogo}
                  src={withBasePath("/sponsors/maximor.svg")}
                  alt="Maximor"
                />
              </span>
            </span>
          </p>
        </div>
        <div
          className={styles.identityRow}
          data-name-length={
            identity.length > 14 ? "long" : identity.length > 8 ? "medium" : "short"
          }
        >
          {showPhoto ? (
            <span className={styles.photoFrame}>
              {/* A plain image keeps the component compatible with attendee image URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.photoImg}
                src={photo}
                crossOrigin="anonymous"
                alt={`${identity}'s profile`}
                onError={() => setPhotoFailed(true)}
              />
            </span>
          ) : null}
          <div className={styles.identityBlock}>
            <h2 className={styles.identity}>{identity}</h2>
            <p className={styles.fromLine}>{username}</p>
          </div>
        </div>
        {teamName?.trim() ? (
          <p className={styles.teamLine}>TEAM {teamName.trim().toUpperCase()}</p>
        ) : null}
        {/* The visible sponsors/partners label names this group; a bare
            aria-label on a generic div would not be exposed anyway. */}
        <div className={styles.sponsorRow}>
          <span className={styles.sponsorLabel}>SPONSORED BY</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={`${styles.sponsorLogo} ${styles.sponsorLogoDodo}`} src={withBasePath("/sponsors/dodo-payments-dark.webp")} alt="Dodo Payments" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={`${styles.sponsorLogo} ${styles.sponsorLogoNeatlogs}`} src={withBasePath("/sponsors/neatlogs-lockup.svg")} alt="Neatlogs" />
          <span className={styles.sponsorChip}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.sponsorChipLogo} src={withBasePath("/sponsors/tensormux.png")} alt="TensorMux" />
          </span>
          <span className={`${styles.sponsorChip} ${styles.sponsorChipAiGrants}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`${styles.sponsorChipLogo} ${styles.sponsorChipLogoAiGrants}`} src={withBasePath("/sponsors/ai-grants-india.svg")} alt="AI Grants India" />
          </span>
        </div>
        <div className={styles.frontFooter}>
          <p className={styles.passType}>{passType.toUpperCase()}</p>
          <p className={styles.dateLine}>
            {date.toUpperCase()} · {format.toUpperCase()}
          </p>
        </div>
      </div>
      <PassStub />
      <PassNotches />
    </section>
  );
}

interface PassBackFaceProps {
  visible: boolean;
  shader: ShaderLayerProps;
  teamName?: string;
  ticketId: string;
}

export function PassBackFace({
  visible,
  shader,
  teamName,
  ticketId,
}: PassBackFaceProps) {
  return (
    <section
      className={`${styles.face} ${styles.back}`}
      aria-hidden={!visible}
      data-active={visible}
    >
      <ShaderLayer {...shader} />
      <span className={styles.logoField} aria-hidden="true" />
      <div className={styles.backCopy}>
        <h2 className={styles.mission}>
          <span className={styles.missionLine}>YOUR IDEA.</span>
          <span className={styles.missionLine}>AN ARMY OF AGENTS.</span>
        </h2>
        <div className={styles.backDetails}>
          {teamName?.trim() ? (
            <div className={styles.detailCell}>
              <span className={styles.detailLabel}>TEAM</span>
              <span className={styles.detailValue}>{teamName.trim()}</span>
            </div>
          ) : null}
          <div className={styles.detailCell}>
            <span className={styles.detailLabel}>TICKET ID</span>
            <span className={styles.detailValue}>{ticketId}</span>
          </div>
          <p className={styles.backMeta}>TEAMS UP TO 4</p>
          <p className={styles.backMeta}>AOAGENTS.DEV</p>
        </div>
      </div>
      <PassStub />
      <PassNotches />
    </section>
  );
}
