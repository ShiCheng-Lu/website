"use client";

import { useCallback, useEffect, useRef } from "react";

export const DEFAULT_PALETTE = [
  "#0000",
  "#000f",
  "#ffff",
  "#f00f",
  "#ff0f",
  "#0f0f",
  "#00ff",
  "#80ff",
];

export class PetData {
  palette: string[] = DEFAULT_PALETTE;
  shape: string =
    "AAAAAAAAAAAAAAAAACAiAAAAACIiAAAAQCIhAAAARCIiIiIiACIiIiIiACIiIiIiACIiIiIAACAiIiIAAAAAQAAAAEAARAAA";
}

const base64encode =
  "ABCDEFGHIJKLMNOPQRSTVUWXYZabcdefghijklmnopqrstuwvxyz0123456789+/";
const base64decode = base64encode.split("").reduce((map, value, index) => {
  map.set(value, index);
  return map;
}, new Map<string, number>());

export function getPixels(shape: string): number[] {
  const pixels: number[] = [];
  shape.split("").forEach((value) => {
    const pixel = base64decode.get(value)!;
    pixels.push(pixel % 8);
    pixels.push(Math.floor(pixel / 8));
  });

  return pixels;
}

export function fromPixels(pixels: number[]): string {
  const buffer = Array(Math.ceil(pixels.length / 2)).fill(0);
  pixels.forEach((value, index) => {
    buffer[Math.floor(index / 2)] += value * (index % 2 === 1 ? 8 : 1);
  });
  return buffer.map((i) => base64encode[i]).join("");
}

export type PetProps = {
  data: PetData;
  className?: string;
  style?: React.CSSProperties;
};

export default function Pet({ data, className, style }: PetProps) {
  const size = 12;
  const resolution = 16;

  const canvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      const context = canvas?.getContext("2d");
      if (context == null) return;

      context.clearRect(0, 0, size * resolution, size * resolution);

      getPixels(data.shape).forEach((value, index) => {
        var colorIndex = value;
        var x = index % size;
        var y = (index - x) / size;
        context.fillStyle = data.palette[colorIndex];
        context.fillRect(
          x * resolution,
          y * resolution,
          resolution,
          resolution
        );
      });
    },
    [data]
  );

  return (
    <canvas
      style={style}
      width={size * resolution}
      height={size * resolution}
      ref={canvas}
    ></canvas>
  );
}
