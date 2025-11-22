"use client";

import { useState } from "react";
import styles from "./page.module.css";
import DraggableWindow from "@/components/DraggableWindow";
import ReactPlayer from "react-player";

export default function Home() {
  const [open, setOpen] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  return (
    <div className={styles.page}>
      <h1>Is this an website?</h1>

      <DraggableWindow
        title="For the zoomers"
        opened={open}
        onClose={() => {
          setOpen(false);
        }}
        initialX={150}
        initialY={50}
      >
        <div
          onClick={() => {
            setPlaying(!playing);
          }}
        >
          <div
            style={{
              width: "10%",
              position: "absolute",
              zIndex: 10,
            }}
          >
            {muted ? (
              <img
                src="icons/audio-off.svg"
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted(!muted);
                }}
              ></img>
            ) : (
              <img
                src="icons/audio.svg"
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted(!muted);
                }}
              ></img>
            )}
          </div>

          {!playing && (
            <img
              src="icons/play.svg"
              style={{
                position: "absolute",
                width: "50%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.8,
              }}
            ></img>
          )}
          <ReactPlayer
            src="subway-surfers.mp4"
            width={9 * 30}
            height={16 * 30}
            playing={playing}
            muted={muted}
          />
        </div>
      </DraggableWindow>
    </div>
  );
}
