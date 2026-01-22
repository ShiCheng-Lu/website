"use client";

import { useRef } from "react";

export default function Icon() {
  const size = 192;
  const bodySize = 24;
  const slotSize = 18;

  const SQRT3 = Math.sqrt(3);

  const svgContainer = useRef<HTMLDivElement>(null);

  const point = (a: number, b: number, c: number) => {
    const x = size / 2 + ((b + c) / 2) * SQRT3;
    const y = size / 2 - a - (b - c) / 2;
    return `${x} ${y}`;
  };

  const path = (p: [number, number, number][]) => {
    const path = p.map(([a, b, c]) => point(a, b, c));
    return `M ${path.join(" L ")} Z`;
  };

  const copySVG = () => {
    const container = svgContainer.current;
    if (!container) {
      return;
    }
    navigator.clipboard.writeText(container.innerHTML);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div>
        <button onClick={copySVG}>Copy</button>
      </div>
      <div
        style={{ border: "solid 1px black", width: "fit-content" }}
        ref={svgContainer}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width={size}
          height={size}
          fill="black"
        >
          <path
            d={path([
              [0, 0, -bodySize * 3 - slotSize],
              [0, bodySize * 2, -bodySize * 3 - slotSize],
              [0, -bodySize, -slotSize],
              [0, -bodySize, -slotSize - 2 * bodySize],
            ])}
          />
          <path
            d={path([
              [0, -(bodySize * 3 + slotSize), 0],
              [0, -bodySize - slotSize, -bodySize * 2],
              [0, -bodySize - slotSize, 0],
              [-bodySize * 2, -bodySize - slotSize, 0],
            ])}
          />
          <path
            d={path([
              [0, bodySize + slotSize, 0],
              [bodySize * 2, bodySize + slotSize, 0],
              [0, bodySize * 3 + slotSize, 0],
              [0, bodySize + slotSize, bodySize * 2],
            ])}
          />
          <path
            d={path([
              [bodySize * 3 + slotSize, 0, 0],
              [bodySize * 3 + slotSize, 0, bodySize],
              [slotSize, bodySize, 0],
              [bodySize + slotSize, 0, 0],
              [bodySize, 0, 0],
              [0, bodySize, 0],
              [-slotSize, 0, bodySize],
              [0, 0, bodySize + slotSize],
              [bodySize, 0, bodySize + slotSize],
              [0, bodySize, slotSize],
              [0, bodySize, slotSize + bodySize * 2],
              [0, 0, slotSize + bodySize * 3],
              [-bodySize * 3 - slotSize, 0, 0],
              [-bodySize * 2 - slotSize, -bodySize, 0],
              [-slotSize, -bodySize, 0],
              [-bodySize - slotSize, 0, 0],
              [-bodySize, 0, 0],
              [0, -bodySize, 0],
              [bodySize * 2 + slotSize, 0, -bodySize],
            ])}
          />
          {/* <path
            d={`M ${x1} ${y0} L ${x0} ${y1} L ${x0} ${y2} L ${x1} ${y3} L ${x2} ${y2} L ${x2} ${y1} Z`}
          /> */}
        </svg>
      </div>
    </div>
  );
}
