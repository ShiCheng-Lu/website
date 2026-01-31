"use client";

import Link from "next/link";
import { CSSProperties } from "react";

export default function TestList() {
  const style: CSSProperties = {
    border: "black solid 1px",
  };
  return (
    <div
      style={{
        margin: 10,
        flexDirection: "column",
        display: "flex",
        gap: 10,
      }}
    >
      <Link style={style} href="test/triangulation">
        triangulation
      </Link>
      <Link style={style} href="test/triangulation">
        triangulation
      </Link>
    </div>
  );
}
