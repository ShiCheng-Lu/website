"use client";

import DraggableWindow from "@/components/DraggableWindow";
import { useState, useEffect, ReactNode } from "react";
import styles from "./page.module.css";
import ReactPlayer from "react-player";
import {
  BsFillPlayFill,
  BsFillVolumeMuteFill,
  BsFillVolumeUpFill,
} from "react-icons/bs";

export type VideoPlayerWindowProp = {
  title: ReactNode;
  onClose: () => void;
  open: boolean;
  src: string;
};

export default function VideoPlayerWindow({
  onClose,
  open,
  src,
  title,
}: VideoPlayerWindowProp) {
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
    initialPos && (
      <DraggableWindow
        title={title}
        opened={open}
        onClose={() => {
          setPlaying(false);
          onClose();
        }}
        initialX={initialPos.x}
        initialY={initialPos.y}
      >
        <div onClick={() => setPlaying(!playing)}>
          {muted ? (
            <BsFillVolumeMuteFill
              className={styles.audio}
              onClick={(e) => {
                e.stopPropagation();
                setMuted(false);
              }}
            />
          ) : (
            <BsFillVolumeUpFill
              className={styles.audio}
              onClick={(e) => {
                e.stopPropagation();
                setMuted(true);
              }}
            />
          )}

          {!playing && <BsFillPlayFill className={styles.start} />}
          <ReactPlayer
            src={src}
            width={width}
            height={height}
            playing={playing}
            muted={muted}
            loop={true}
            playsInline={true}
          />
        </div>
      </DraggableWindow>
    )
  );
}
