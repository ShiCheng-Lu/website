"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { Table } from "./PingPongModels";
import Camera from "@/util/three-camera";
import { startLobby } from "@/util/peer2peer";

export default function PingPong() {
  const [ball, setBall] = useState(new Vector3());
  const [paddle, setPaddle] = useState(new Vector3());

  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const zOffset = 2;

      const scale =
        (Math.tan((15 * Math.PI) / 180) * (50 - zOffset)) / window.innerHeight;
      const y = (window.innerHeight / 2 - e.clientY) * scale;
      const x = (e.clientX - window.innerWidth / 2) * scale;

      paddle.set(x, y, zOffset);

      setPaddle(paddle.clone());
    };

    window.addEventListener("pointermove", pointerMove);

    return () => {
      window.removeEventListener("pointermove", pointerMove);
    };
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        userSelect: "none",
      }}
      onScroll={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Canvas style={{ flex: 1, touchAction: "none", background: "green" }}>
        <Camera position={[0, 0, 50]} fov={15} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={3} />

        <Table />

        {/* Ball */}
        <mesh position={ball}>
          <sphereGeometry args={[0.0656168]} />
          <meshStandardMaterial color="white" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Paddle */}
        <mesh position={paddle}>
          <mesh>
            <circleGeometry args={[0.25]} />
            <meshStandardMaterial color="red" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3]} />
            <meshStandardMaterial color={"#966F33"} />
          </mesh>
        </mesh>
      </Canvas>
      <div style={{ position: "fixed", top: 0, left: 0 }}>
        <button
          onClick={() => {
            startLobby();
          }}
        >
          Start lobby
        </button>
      </div>
    </div>
  );
}
