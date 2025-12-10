"use client";

import BackButton from "@/components/BackButton";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Euler, Vector3 } from "three";
import { noise } from "./SimplexNoise";

function Camera({
  fov,
  location,
  rotation,
}: {
  fov: number;
  location: Vector3;
  rotation: Euler;
}) {
  const { camera } = useThree();

  useEffect(() => {
    (camera as any).fov = fov;
    camera.position.set(location.x, location.y, location.z);
    camera.rotation.set(rotation.x, rotation.y, rotation.z, rotation.order);
    camera.updateProjectionMatrix();
  }, [fov, location]);

  return null;
}

const movementKeys: { [key: string]: Vector3 } = {
  KeyW: new Vector3(0, 0, -1),
  KeyS: new Vector3(0, 0, 1),
  KeyA: new Vector3(-1, 0, 0),
  KeyD: new Vector3(1, 0, 0),
  Space: new Vector3(0, 1, 0),
  ShiftLeft: new Vector3(0, -1, 0),
};

function getBlocks() {
  const blocks = [];
  for (let x = -50; x < 50; ++x) {
    for (let z = -50; z < 50; ++z) {
      const y = noise(new Vector3(x / 10, 0, z / 10)) * 10;
      blocks.push(new Vector3(x, y, z));
    }
  }
  return blocks;
}

export default function NoiseDemo() {
  const [blocks, setBlocks] = useState(getBlocks());
  const movement = useRef(new Vector3());
  const [location, setLocation] = useState(new Vector3(0, 5, 0));
  const [rotation, setRotation] = useState(new Euler(0, 0, 0, "YXZ"));

  // setup input
  useEffect(() => {
    const keydownEventHandler = (e: KeyboardEvent) => {
      if (e.repeat) return; // don't presses repeatting key events
      for (const key in movementKeys) {
        if (e.code === key) {
          movement.current.add(movementKeys[key]);
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
      console.log(`up ${e.code} ${JSON.stringify(movement)}`);
    };
    const mouseMoveEventHandler = (e: MouseEvent) => {
      // console.log(e.movementX, e.movementY);
      if (!document.pointerLockElement) {
        return;
      }

      rotation.x -= e.movementY * 0.001;
      rotation.x = Math.min(Math.max(rotation.x, -Math.PI / 2), Math.PI / 2);
      rotation.y -= e.movementX * 0.001;
      setRotation(rotation.clone());
    };
    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("mousemove", mouseMoveEventHandler);

    // game loop
    const fps = 60;
    const timout = setInterval(() => {
      const diff = movement.current.clone();
      diff.multiplyScalar(0.2);
      diff.applyEuler(new Euler(0, rotation.y, 0));
      location.add(diff);
      setLocation(location.clone());
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
        style={{ flex: 1, touchAction: "none", background: "blue" }}
        onClick={(e) => {
          (e.target as any)?.requestPointerLock();
        }}
      >
        <Camera fov={70} location={location} rotation={rotation}></Camera>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={3} />

        <rectAreaLight />
        {blocks.map((position, index) => (
          <mesh position={position} key={index}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="white"
              roughness={0.5}
              metalness={0.7}
            />
          </mesh>
        ))}
      </Canvas>
      <BackButton />
    </div>
  );
}
