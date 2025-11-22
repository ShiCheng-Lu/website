"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import DraggableWindow from "@/components/DraggableWindow";
import ReactPlayer from "react-player";

export default function Home() {
  const [open, setOpen] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

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

      {initialPos && (
        <DraggableWindow
          title="For the zoomers"
          opened={open}
          onClose={() => {
            setOpen(false);
          }}
          initialX={initialPos.x}
          initialY={initialPos.y}
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
      )}
    </div>
  );
}
