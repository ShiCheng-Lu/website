"use client";

import { useState } from "react";
import styles from "./page.module.css";
import DraggableWindow from "@/components/DraggableWindow";
import ReactPlayer from "react-player";

export default function Home() {
  const [open, setOpen] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const width = 9 * 30;
  const height = 16 * 30 - 1;

  return (
    <div className={styles.page}>
      <h1>Is this an website?</h1>

      <DraggableWindow
        title="For the zoomers"
        opened={open}
        onClose={() => {
          setOpen(false);
        }}
        initialX={Math.random() * (window.innerWidth - width)}
        initialY={Math.random() * (window.innerHeight - height)}
      >
        <div
          onClick={() => {
            setPlaying(!playing);
          }}
        >
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
          />
        </div>
      </DraggableWindow>
    </div>
  );
}
