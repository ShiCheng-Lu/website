"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Euler, Quaternion, Vector2, Vector3 } from "three";
import { Arrow, Floor, Target } from "./ArcheryModels";
import BackButton from "@/components/BackButton";
import SettingsButton from "@/components/SettingsButton";

function Camera({ fov, position }: { fov: number; position: Vector3 }) {
  const { camera } = useThree();

  useEffect(() => {
    (camera as any).fov = fov;
    camera.position.set(position.x, position.y, position.z);
    camera.updateProjectionMatrix();
  }, [fov, position]);

  return null;
}

export default function Archery() {
  const [position, setPosition] = useState(new Vector3(0, -0.05, 0));
  const [rotation, setRotation] = useState(new Vector2());
  const [drift, setDrift] = useState(new Vector2());
  const [driftTarget, setDriftTarget] = useState(new Vector2());
  const [aimTime, setAimTime] = useState<number>();
  const [velocity, setVelocity] = useState(new Vector3(0));
  const [checkTarget, setCheckTarget] = useState(false);
  const [power, setPower] = useState(0);
  const [distance, setDistance] = useState(18);
  const [hint, setHint] = useState(true);
  const [camera, setCamera] = useState(new Vector3());

  const fps = 60;
  const floor = -1.25;

  // fired arrow, this function compute physics
  useEffect(() => {
    if (velocity.lengthSq() == 0 || aimTime) {
      return;
    }
    const timeout = setTimeout(() => {
      setPosition(position.add(velocity.clone().divideScalar(fps)).clone());
      if (position.z > 1 - distance && position.y > floor) {
        setVelocity(velocity.add(new Vector3(0, -9.8 / fps, 0)).clone());
        setRotation(
          new Vector2(
            Math.atan2(
              velocity.y,
              Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
            ),
            Math.atan2(-velocity.x, -velocity.z)
          )
        );
        setDrift(new Vector2());
      } else {
        // hit target
        setVelocity(new Vector3(0));
        setCheckTarget(true);
        if (position.distanceTo({ x: 0, y: 0, z: -distance }) < 0.8) {
          setCamera(new Vector3(0, 0, 3 - distance));
        } else {
          setCamera(new Vector3(0, 0.15, 3).add(position));
        }
      }
    }, 1000 / fps);
    return () => clearTimeout(timeout);
  }, [velocity, position]);

  // aiming, this function randomly drift the aim left and right
  const setNewDriftTarget = () => {
    const angle = Math.random() * Math.PI;
    const x = Math.sin(angle);
    const y = Math.cos(angle);
    const target = new Vector2(x - rotation.x, y - rotation.y);
    target.multiplyScalar(0.01);
    setDriftTarget(target);
  };

  useEffect(() => {
    if (!aimTime) return;
    setTimeout(() => {
      const diff = driftTarget.clone().sub(drift);
      if (diff.lengthSq() < 0.0001 * 0.0001) {
        setNewDriftTarget();
      } else {
        diff.normalize().multiplyScalar(0.0001);
        setDrift(drift.clone().add(diff));
      }
      const power = Math.min(1, (Date.now() - aimTime) / 2000);
      setPower(power);
      setPosition(new Vector3(0, -0.05, (power - 1) * 0.3));
    }, 1000 / fps);
  }, [aimTime, drift, driftTarget]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 2 || checkTarget) {
      return;
    }
    setPower(0);
    setPosition(new Vector3(0, -0.05, 0.3));
    setRotation(new Vector2(distance / 1500, 0));
    setNewDriftTarget();
    setAimTime(Date.now());

    (e.target as any)?.requestPointerLock();
    setHint(false);
  };

  // release + reset, depending on if the arrow is drawn or fired
  const onPointerUp = () => {
    setAimTime(undefined);
    const onFloor = position.y < floor + 0.01;
    const onTarget = position.z < -2;
    if (onTarget || onFloor) {
      setPosition(new Vector3(0, -0.05, 0.3));
      setRotation(new Vector2(distance / 1500, 0));
      setDrift(new Vector2());
      setVelocity(new Vector3(0));
      if (!onFloor) {
        return;
      }
    }
    if (checkTarget || !aimTime) {
      setCheckTarget(false);
      setCamera(new Vector3());
      return;
    }
    // aim for 2 seconds for full power
    const vel = new Vector3(0, 0, -50 * power);
    const rotator = new Euler(rotation.x + drift.x, rotation.y + drift.y, 0);
    // const rotator = new Euler();
    setVelocity(vel.applyEuler(rotator));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (checkTarget || !aimTime) {
      return;
    }
    const movement = new Vector2(e.movementY, e.movementX);
    movement.multiplyScalar(0.00015);
    setRotation(rotation.clone().sub(movement));
  };

  const changeRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (aimTime) {
      return;
    }
    const newDistance = parseInt(e.target.value);
    setDistance(newDistance);
    setRotation(new Vector2(newDistance / 1500, 0));
  };

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
        style={{ flex: 1, touchAction: "none", background: "wheat" }}
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
        <Camera fov={30} position={camera}></Camera>
        <directionalLight position={[2, 2, 5]} color="white" intensity={3} />

        <Target distance={distance} />
        <Arrow
          position={position}
          rotation={[rotation.x + drift.x, rotation.y + drift.y, 0]}
        />

        {/* Sight */}

        <Floor floorLevel={floor} />
        <mesh></mesh>
      </Canvas>
      {hint && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            translate: "-50% -50%",
            color: "white",
            fontSize: 28,
            background: "#0008",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "1rem",
            pointerEvents: "none",
          }}
        >
          <p>Hold to draw the bow</p>
          <p>Move to aim</p>
          <p>Release to shoot</p>
          <p>Click to pick up arrow</p>
        </div>
      )}

      <BackButton />
      <SettingsButton>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "1rem",
            userSelect: "none",
          }}
        >
          <label htmlFor="target-distance">Distance</label>
          <input
            id="target-distance"
            type="range"
            value={distance}
            min="5"
            max="70"
            onChange={changeRange}
          />
          <p style={{ width: "32px" }}>{distance}m</p>
        </div>
      </SettingsButton>
    </div>
  );
}
