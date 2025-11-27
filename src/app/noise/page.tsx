"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

export default function NoiseDemo() {
  const [movement, setMovement] = useState({ x: 0, y: 0, z: 0 });

  // setup input
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      e.key;
      if (e.key === "w") {
        setMovement({ ...movement, x: 1 });
      }
      if (e.key === "s") {
        setMovement({ ...movement, x: -1 });
      }
      if (e.key === "a") {
        setMovement({ ...movement, z: -1 });
      }
      if (e.key === "d") {
        setMovement({ ...movement, z: 1 });
      }
      if (e.key === "Escape") {
      }
      console.log(e.key);
      //
    });
    window.addEventListener("keyup", (e) => {
      //
    });
    window.addEventListener("mousemove", (e) => {
      //   console.log(e.movementX, e.movementY);
    });
  }, []);

  const [blocks, setBlocks] = useState([]);

  return (
    <Canvas
      style={{ background: "black", width: 100, height: 100 }}
      onClick={(e) => {
        (e.target as any)?.requestPointerLock();
      }}
    >
      
      {blocks.map(() => {
        return <></>;
      })}
    </Canvas>
  );
}
