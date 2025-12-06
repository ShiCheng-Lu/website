"use client";

import { useState } from "react";

export default function Terminal() {
  const [text, setText] = useState("a");
  const [cursor, setCursor] = useState(0);

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Backspace":
        setText(text.slice(0, -1));
        break;

      default:
        setText(text + e.key);
    }
  };

  return (
    <div
      style={{ width: "100%", height: "100%", position: "fixed" }}
      autoFocus
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {text}
    </div>
  );
}
