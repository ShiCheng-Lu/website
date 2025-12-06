"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { PetData, DEFAULT_PALETTE, fromPixels, getPixels } from "./Pet";

export type PetDrawerProps = {
  setData: (pet: PetData) => void;
};

export default function PetDrawer({ setData }: PetDrawerProps) {
  const size = 12;
  const scale = 20;
  const [drawing, setDrawing] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState(Array(size * size).fill(0));
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  const draw = (e: React.PointerEvent) => {
    const context = canvas.current?.getContext("2d");
    if (context == null) return;

    const bounds = e.currentTarget.getBoundingClientRect();

    const x = Math.floor((e.clientX - bounds.x) / scale);
    const y = Math.floor((e.clientY - bounds.y) / scale);

    context.clearRect(x * scale, y * scale, scale, scale);
    context.fillStyle = palette[colorIndex];
    context.fillRect(x * scale, y * scale, scale, scale);

    const index = x + y * size;
    if (pixels[index] != colorIndex) {
      const newPixels = [...pixels];
      newPixels[x + y * size] = colorIndex;
      setPixels(newPixels);
    }
  };

  useEffect(() => {
    setData({
      palette,
      shape: fromPixels(pixels),
    });
  }, [palette, pixels]);

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
            onChange={(e) => e.target.checked && onSelectColor(index)}
          />
        ))}
      </div>
    </div>
  );
}
