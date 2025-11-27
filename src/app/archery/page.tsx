"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Point, add, sub, mul, abs } from "@/util/point";

export default function Archery() {
  const [location, setLocation] = useState<Point>();
  const [updateFunction, setUpdateFunction] = useState<any>();

  const [drift, setDrift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLocation({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  }, []);

  return (
    <div
      onMouseDown={(e) => {
        if (typeof window === "undefined" || !location) return;

        if (updateFunction) {
          window.removeEventListener("pointermove", updateFunction.update);
          clearInterval(updateFunction.driftTimeout);
        }
        const startX = e.clientX - location.x;
        const startY = e.clientY - location.y;
        // this must be an object reference, otherwise something something to do with states and it doesn't update the state of updateFunction, and we get a null reference on mouse release
        const updateLocation: {
          update: (e: PointerEvent) => void;
          drift: (e: any) => void;
          driftTimeout?: NodeJS.Timeout;
          driftValue: Point;
          driftTarget: Point;
        } = {
          update: (e: PointerEvent) => {
            if (!e) return;
            setLocation({
              x: e.clientX - startX,
              y: e.clientY - startY,
            });
          },
          driftValue: { x: 0, y: 0 },
          driftTarget: { x: 0, y: 0 },
          drift: (e) => {
            const driftDir = sub(e.driftTarget, e.driftValue);
            if (abs(driftDir) < 10) {
              const newDrift = Math.random() * 100;
              const driftDir = Math.random() * Math.PI * 2;

              e.driftTarget = {
                x: newDrift * Math.sin(driftDir),
                y: newDrift * Math.cos(driftDir),
              };
            } else {
              e.driftValue = add(
                e.driftValue,
                mul(driftDir, 0.5 / abs(driftDir))
              );
              setDrift(e.driftValue);
            }
          },
        };
        setUpdateFunction(updateLocation);
        updateLocation.driftTimeout = setInterval(
          () => updateLocation.drift(updateLocation),
          0.1
        );
        window.addEventListener("pointermove", updateLocation.update);
      }}
      onMouseUp={() => {
        if (typeof window === "undefined") return;

        window.removeEventListener("pointermove", updateFunction.update);
        clearInterval(updateFunction.driftTimeout);
        setUpdateFunction(undefined);
      }}
    >
      <img
        className={styles.target}
        src="archery/target.jpg"
        draggable={false}
      ></img>
      {location && (
        <img
          className={styles.arrow}
          style={{
            left: location.x + drift.x,
            top: location.y + drift.y,
          }}
          src="archery/arrow.png"
          draggable={false}
        ></img>
      )}
    </div>
  );
}
