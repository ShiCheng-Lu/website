"use client";

import React, { CSSProperties, JSX } from "react";
import { useEffect, useRef, useState } from "react";

export default function ClickAnimation({
  children,
  duration,
  onPointerDown,
  onPointerMove,
  clickAnimation,
}: {
  children: React.ReactNode;
  duration: number;
  onPointerDown: (e: React.PointerEvent) => boolean;
  onPointerMove: (e: React.PointerEvent) => void;
  clickAnimation: React.ReactElement<{ style: CSSProperties }>;
}) {
  const cursors = useRef<React.ReactElement[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const [update, setUpdate] = useState(true);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onPointerDown(e)) return;
    // onClick returned true, so we play the animation
    const bound = container.current?.getBoundingClientRect();
    if (!bound) return;

    const newCursor = React.cloneElement(clickAnimation, {
      style: {
        top: e.clientY - bound.y,
        left: e.clientX - bound.x,
        position: "absolute",
      },
      key: Math.random(),
    });

    cursors.current.push(newCursor);
    setUpdate(!update);
    setTimeout(() => {
      cursors.current.shift();
      setUpdate(!update);
    }, duration);
  };

  return (
    <div onPointerDown={handlePointerDown} onPointerMove={onPointerMove}>
      {children}
      <div
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        ref={container}
      >
        {cursors.current.length > 0 && cursors.current}
      </div>
    </div>
  );
}
