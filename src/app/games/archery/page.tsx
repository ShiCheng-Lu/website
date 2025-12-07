"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Euler, Quaternion, Vector2, Vector3 } from "three";
import { Arrow, Target } from "./ArcheryModels";
import BackButton from "@/components/BackButton";

function Camera({ fov, position }: { fov: number; position: number[] }) {
  const { camera } = useThree();

  useEffect(() => {
    (camera as any).fov = fov;
    camera.position.set(position[0], position[1], position[2]);
    camera.updateProjectionMatrix();
  }, [fov, position]);

  return null;
}

export default function Archery() {
  const [position, setPosition] = useState(new Vector3(0, -0.05, 0));
  const [rotation, setRotation] = useState(new Vector2());
  const [drift, setDrift] = useState(new Vector2());
  const [driftTarget, setDriftTarget] = useState(new Vector2());
  const [aiming, setAiming] = useState(false);
  const [velocity, setVelocity] = useState(new Vector3(0));
  const [checkTarget, setCheckTarget] = useState(false);

  const fps = 60;
  const distance = 18; // or 25

  useEffect(() => {
    if (velocity.lengthSq() == 0) {
      return;
    }
    const timeout = setTimeout(() => {
      setPosition(position.add(velocity.clone().divideScalar(fps)).clone());
      if (position.z > 1 - distance) {
        setVelocity(velocity.add(new Vector3(0, -9.8 / fps, 0)).clone());
      } else {
        setVelocity(new Vector3(0));
        setCheckTarget(true);
      }
    }, 1000 / fps);
    return () => clearTimeout(timeout);
  }, [velocity, position]);

  const setNewDriftTarget = () => {
    const angle = Math.random() * Math.PI;
    const x = Math.sin(angle);
    const y = Math.cos(angle);
    const target = new Vector2(x - rotation.x, y - rotation.y);
    target.multiplyScalar(0.01);
    setDriftTarget(target);
  };

  useEffect(() => {
    if (!aiming) return;
    setTimeout(() => {
      const diff = driftTarget.clone().sub(drift);
      if (diff.lengthSq() < 0.0001 * 0.0001) {
        setNewDriftTarget();
      } else {
        diff.normalize().multiplyScalar(0.0001);
        setDrift(drift.clone().add(diff));
      }
    }, 1000 / fps);
  }, [aiming, drift, driftTarget]);

  const onPointerDown = () => {
    if (checkTarget) {
      return;
    }
    setNewDriftTarget();
    setAiming(true);
  };

  const onPointerUp = () => {
    if (position.z < -2) {
      setPosition(new Vector3(0, -0.05, 0));
      setVelocity(new Vector3(0));
      return;
    }
    if (checkTarget || !aiming) {
      setCheckTarget(false);
      return;
    }
    setAiming(false);

    const vel = new Vector3(0, 0, -50);
    const rotator = new Euler(rotation.x + drift.x, rotation.y + drift.y, 0);
    // const rotator = new Euler();
    setVelocity(vel.applyEuler(rotator));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (checkTarget || !aiming) {
      return;
    }
    const movement = new Vector2(e.movementY, e.movementX);
    movement.multiplyScalar(0.0001);
    setRotation(rotation.clone().sub(movement));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <BackButton />
      <Canvas
        style={{ flex: 1 }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        camera={{
          fov: 30,
          near: 0.1,
          far: 1000,
          position: [0, 0, 0],
        }}
      >
        <Camera
          fov={30}
          position={[0, 0, checkTarget ? 2 - distance : 0]}
        ></Camera>
        <directionalLight position={[2, 2, 5]} color="white" intensity={3} />

        {/* Target */}
        <Target distance={distance} />

        {/* Arrow */}
        <Arrow
          position={position}
          rotation={[rotation.x + drift.x, rotation.y + drift.y, 0]}
        />

        {/* Sight */}
        <mesh></mesh>
      </Canvas>
    </div>
  );
}
