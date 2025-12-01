"use client";

import React, { CSSProperties, JSX } from "react";
import { useEffect, useRef, useState } from "react";

export default function ClickAnimation({
  children,
  setClickHandler,
  duration,
}: {
  children: React.ReactElement<{ style: CSSProperties }>;
  setClickHandler: any;
  duration: number;
}) {
  const cursors = useRef<React.ReactElement[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const [update, setUpdate] = useState(true);

  const click = (x: number, y: number) => {
    const bound = container.current?.getBoundingClientRect();
    if (!bound) return;

    const newCursor = React.cloneElement(children, {
      style: { top: y - bound.y, left: x - bound.x, position: "absolute" },
      key: Math.random(),
    });

    cursors.current.push(newCursor);
    setUpdate(!update);
    setTimeout(() => {
      cursors.current.shift();
      setUpdate(!update);
    }, duration);
  };

  useEffect(() => {
    setClickHandler(() => {
      // must be wrapped because setState can take a function of prev state, so when state is a function, it must be wrapped in another function
      return click;
    });
  }, [setClickHandler, click]);

  return (
    <div
      style={{
        position: "absolute",
      }}
      ref={container}
    >
      {cursors.current.length > 0 && cursors.current}
    </div>
  );
}
