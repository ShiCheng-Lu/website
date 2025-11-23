"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import DraggableWindow from "@/components/DraggableWindow";
import ReactPlayer from "react-player";
import PaymentPopup from "@/components/PaymentPopup";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { CgInfo } from "react-icons/cg";

export default function Home() {
  const [open, setOpen] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [payment, setPayment] = useState(false);

  const width = 9 * 30;
  const height = 16 * 30 - 1;

  const [initialPos, setInitialPos] = useState<{ x: number; y: number }>();

  useEffect(() => {
    if (typeof window != "undefined") {
      setInitialPos({
        x: Math.random() * (window.innerWidth - width),
        y: Math.random() * (window.innerHeight - height),
      });
    } else {
      setInitialPos({ x: 150, y: 50 });
    }
  }, []);

  return (
    <div className={styles.page}>
      <h1>Is this a website?</h1>
      <br />
      <div>
        <div className={styles.intro}>
          <p
            className={styles.quote}
            style={{ top: 0, left: 0, transform: "translate(-20px, -30px)" }}
          >
            “
          </p>
          <p>
            Sure! Here’s a self-introduction with an intentionally
            "AI-generated" vibe for your website:
          </p>
          <br />
          <hr />
          <br />
          <p>
            Greetings. I am a human programmer engaged in the creation of
            various digital projects. My work spans multiple domains and
            technologies, driven by exploration and an ongoing pursuit of
            knowledge. I produce a range of applications, tools, and systems —
            each one an experiment, an iteration, or a solution, depending on
            the parameters at hand.
          </p>
          <br />
          <p>
            This site serves as a catalog of these endeavors, showcasing a
            diverse set of outputs derived from curiosity, computational logic,
            and occasional unpredictability. You are invited to explore the
            results of these activities. Your engagement is both expected and
            welcomed. Thank you for visiting.
          </p>
          <p
            className={styles.quote}
            style={{ bottom: 0, right: 0, transform: "translate(20px, 50px)" }}
          >
            ”
          </p>
        </div>
        <div className={styles.quoteAttribution}>
          <p>— ChatGippity</p>
          <CgInfo
            data-tooltip-id="ai-info"
            data-tooltip-content="One of the few times I'll exploit the power of GPT"
          />
          <Tooltip id="ai-info" />
        </div>
      </div>

      <Link className={styles.navButton} href="/archery">
        Try archery? 🏹
      </Link>

      <Link className={styles.navButton} href="https://github.com/ShiCheng-Lu">
        More of PROgrammer 💻
      </Link>

      <Link className={styles.navButton} href="/minecraft-computer">
        Minecraft Computer?
      </Link>

      <Link className={styles.navButton} href="/jsfuck">
        I heard ya like JavaScript
      </Link>

      {/* 
      Overlays
      */}
      {payment && (
        <PaymentPopup
          onSubmit={() => {
            setPayment(false);
            setOpen(false);
          }}
        ></PaymentPopup>
      )}

      {initialPos && (
        <DraggableWindow
          title="For the zoomers"
          opened={open}
          onClose={() => {
            setPlaying(false);
            setPayment(true);
          }}
          initialX={initialPos.x}
          initialY={initialPos.y}
        >
          <div onClick={() => setPlaying(!playing)}>
            {muted ? (
              <img
                className={styles.audio}
                src="icons/audio-off.svg"
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted(!muted);
                }}
              />
            ) : (
              <img
                className={styles.audio}
                src="icons/audio.svg"
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted(!muted);
                }}
              />
            )}

            {!playing && <img className={styles.start} src="icons/play.svg" />}
            <ReactPlayer
              src="subway-surfers.mp4"
              width={width}
              height={height}
              playing={playing}
              muted={muted}
              loop={true}
            />
          </div>
        </DraggableWindow>
      )}
    </div>
  );
}
