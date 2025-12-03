"use client";

import { useState, ReactNode } from "react";
import styles from "./page.module.css";
import ReactPlayer from "react-player";
import {
  BsFillPlayFill,
  BsFillVolumeMuteFill,
  BsFillVolumeUpFill,
} from "react-icons/bs";

export type VideoPlayerWindowProp = {
  title: ReactNode;
  onClose: () => Promise<boolean>;
  open: boolean;
  src: string;
  fixedPosition?: boolean;
};

export default function VideoPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  return (
    <div onClick={() => setPlaying(!playing)} style={{ width: 9 * 30 }}>
      {muted ? (
        <BsFillVolumeMuteFill
          className={styles.audio}
          onClick={(e) => {
            e.stopPropagation();
            setMuted(false);
            console.log("Muted presed");
          }}
        />
      ) : (
        <BsFillVolumeUpFill
          className={styles.audio}
          onClick={(e) => {
            e.stopPropagation();
            setMuted(true);
            console.log("unMuted presed");
          }}
        />
      )}

      {!playing && <BsFillPlayFill className={styles.start} />}
      <ReactPlayer
        src={src}
        width={"100%"}
        height={"auto"}
        playing={playing}
        muted={muted}
        loop={true}
        playsInline={true}
      />
    </div>
  );
}
