"use client";

import BackButton from "@/components/BackButton";
import Camera from "@/util/three-camera";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Euler, Vector3, Vector2 } from "three";
import { noise } from "./SimplexNoise";

const movementKeys: { [key: string]: Vector3 } = {
  KeyW: new Vector3(0, 0, -1),
  KeyS: new Vector3(0, 0, 1),
  KeyA: new Vector3(-1, 0, 0),
  KeyD: new Vector3(1, 0, 0),
  Space: new Vector3(0, 1, 0),
  ShiftLeft: new Vector3(0, -1, 0),
};
const rotationKeys: { [key: string]: Vector2 } = {
  ArrowUp: new Vector2(0, 1),
  ArrowDown: new Vector2(0, -1),
  ArrowLeft: new Vector2(1, 0),
  ArrowRight: new Vector2(-1, 0),
};

function getBlocks(center: Vector2) {
  const blocks = [];
  for (let dx = -50; dx < 50; ++dx) {
    for (let dz = -50; dz < 50; ++dz) {
      const x = center.x + dx;
      const z = center.y + dz;
      const y = noise(new Vector3(x / 10, 0, z / 10)) * 10;
      blocks.push(new Vector3(x, y, z));
    }
  }
  return blocks;
}

export default function NoiseDemo() {
  const [blocks, setBlocks] = useState(getBlocks(new Vector2()));
  const movement = useRef(new Vector3());
  const rotate = useRef(new Vector2());
  const [location, setLocation] = useState(new Vector3(0, 5, 0));
  const [rotation, setRotation] = useState(new Euler(0, 0, 0, "YXZ"));
  const renderCenter = useRef(new Vector2());

  // setup input
  useEffect(() => {
    const keydownEventHandler = (e: KeyboardEvent) => {
      if (e.repeat) return; // don't presses repeatting key events
      for (const key in movementKeys) {
        if (e.code === key) {
          movement.current.add(movementKeys[key]);
        }
      }
      for (const key in rotationKeys) {
        if (e.code === key) {
          rotate.current.add(rotationKeys[key]);
        }
      }
      //
      console.log(`down ${e.code} ${JSON.stringify(movement)}`);
    };
    const keyupEventHandler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      for (const key in movementKeys) {
        if (e.code === key) {
          movement.current.sub(movementKeys[key]);
        }
      }
      for (const key in rotationKeys) {
        if (e.code === key) {
          rotate.current.sub(rotationKeys[key]);
        }
      }
      console.log(`up ${e.code} ${JSON.stringify(movement)}`);
    };
    const mouseMoveEventHandler = (e: MouseEvent) => {
      // console.log(e.movementX, e.movementY);
      if (!document.pointerLockElement) {
        return;
      }

      // x axis controls y look (up/down)
      // y axis controls x look, (left/right)
      rotation.x -= e.movementY * 0.001;
      rotation.x = Math.min(Math.max(rotation.x, -Math.PI / 2), Math.PI / 2);
      rotation.y -= e.movementX * 0.001;
      setRotation(rotation.clone());
    };
    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("mousemove", mouseMoveEventHandler);

    // game loop
    const fps = 120;
    const timout = setInterval(() => {
      const diff = movement.current.clone();
      diff.multiplyScalar(0.3);
      diff.applyEuler(rotation);
      location.add(diff);
      setLocation(location.clone());

      // x axis controls y look (up/down)
      // y axis controls x look, (left/right)
      rotation.y += rotate.current.x * 0.05;
      rotation.x += rotate.current.y * 0.05;
      setRotation(rotation.clone());

      const locationXZ = new Vector2(location.x, location.z).floor();
      if (renderCenter.current.manhattanDistanceTo(locationXZ) > 10) {
        renderCenter.current = locationXZ;
        setBlocks(getBlocks(locationXZ));
      }
    }, 1000 / fps);

    return () => {
      window.removeEventListener("keydown", keydownEventHandler);
      window.removeEventListener("keyup", keyupEventHandler);
      window.removeEventListener("mousemove", mouseMoveEventHandler);
      clearInterval(timout);
    };
  }, []);

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
      <Canvas
        style={{ flex: 1, touchAction: "none", background: "white" }}
        onClick={(e) => {
          (e.target as any)?.requestPointerLock();
        }}
      >
        <Camera fov={70} position={location} rotation={rotation}></Camera>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="blue" intensity={3} />

        {blocks.map((position) => (
          <mesh position={position} key={`${position.x}_${position.z}`}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="blue"
              roughness={0.5}
              metalness={0.7}
            />
          </mesh>
        ))}
      </Canvas>
      <BackButton link={"/games"} />
    </div>
  );
}
