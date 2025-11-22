"use client";

import { useState, createRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [location, setLocation] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  return (
    <div className={styles.page}>
      <h1>Is this an website?</h1>

      <div
        style={{
          zIndex: 1,
          position: "absolute",
          top: location.y,
          left: location.x,
          background: "blue",
          height: 100,
          width: 100,
        }}
        onDrag={(e) => {
          setLocation({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }}
        onDragStart={(e) => {
          setDragStart({
            x: e.clientX - location.x,
            y: e.clientY - location.y,
          });
        }}
        onDragEnd={(e) => {
          setLocation({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }}
        draggable
      >
        <text>HEL</text>
      </div>
    </div>
  );
}
