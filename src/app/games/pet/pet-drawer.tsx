"use client";

import { useRef, useState } from "react";
import styles from "./page.module.css";

const DEFAULT_PALETTE = [
  "#0000",
  "#000f",
  "#ffff",
  "#f00f",
  "#f80f",
  "#ff0f",
  "#0f0f",
  "#0aff",
  "#00ff",
  "#80ff",
];

export type PetDrawerProps = {

};

export class Pet {
  
  constructor() {}

  

};

export default function PetDrawer() {
  const size = 16;
  const scale = 20;
  const [data, setData] = useState(Array(16).fill(Array(16).fill(0)));
  const [drawing, setDrawing] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  const draw = (e: React.PointerEvent) => {
    const context = canvas.current?.getContext("2d");
    if (context == null) {
      return;
    }
    const bounds = e.currentTarget.getBoundingClientRect();

    const x = Math.floor((e.clientX - bounds.x) / scale);
    const y = Math.floor((e.clientY - bounds.y) / scale);

    context.clearRect(x * scale, y * scale, scale, scale);
    context.fillStyle = palette[colorIndex];
    context.fillRect(x * scale, y * scale, scale, scale);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDrawing(false);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setDrawing(true);
    draw(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (drawing) {
      draw(e);
    }
  };

  const onSelectColor = (index: number) => {
    if (colorIndex != index) {
      setColorIndex(index);
      return;
    }
    // bring up color wheel
  };

  return (
    <div
      className={styles.PetDrawer}
      style={{ "--scale": scale, "--size": `${size}px` } as React.CSSProperties}
    >
      <canvas
        className={styles.PetDrawerCanvas}
        width={size * scale}
        height={size * scale}
        ref={canvas}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      />

      <div className={styles.ColorPicker}>
        {palette.map((color, index) => (
          <input
            key={index}
            style={{ "--color": color, fill: "#f00" } as React.CSSProperties}
            type="radio"
            name="color"
            checked={colorIndex == index}
            onPointerDown={() => onSelectColor(index)}
          />
        ))}
      </div>
    </div>
  );
}
