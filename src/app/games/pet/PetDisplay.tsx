import { useEffect, useRef, useState } from "react";
import Pet from "./Pet";
import styles from "./page.module.css";
import { Point, sub, abs, div, mul, add } from "@/util/point";
import { PetData } from "@/util/database";

export type PetDisplayProps = {
  pets: PetData[];
};

export const PET_SIZE = 60;

const clip = (val: number, max: number, min: number) => {
  return Math.min(Math.max(val, min), max);
};

export function RandomMove({ children }: { children: React.ReactElement }) {
  const fps = 60;

  const [position, setPosition] = useState(new Point(0, 0));
  const [target, setTarget] = useState(new Point(0, 0));
  const [velocity, setVelocity] = useState(new Point(0, 0));
  const [idle, setIdle] = useState(1);

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (idle > 0) {
        setIdle(0);
        // set a new target
        const bounds = container.current!.getBoundingClientRect();
        var dx = (Math.random() - 0.5) * 100;
        dx += dx > 0 ? 100 : -100;
        var dy = (Math.random() - 0.5) * 100;
        dy += dy > 0 ? 100 : -100;

        const newTarget = {
          x: clip(position.x + dx, bounds.width - PET_SIZE, 0),
          y: clip(position.y + dy, bounds.height - PET_SIZE, 0),
        };
        setTarget(newTarget);

        const diff = sub(newTarget, position);
        const newVelocity = div(diff, abs(diff) * (Math.random() + 1));
        setVelocity(newVelocity);
        return;
      }

      // update position
      const diff = sub(target, position);
      if (Math.abs(diff.x) > Math.abs(velocity.x)) {
        setPosition(add(position, velocity));
        return;
      }
      setPosition(target);
      setIdle(Math.random() * 5 + 5);
    }, Math.max(1 / fps, idle) * 1000);
    return () => clearTimeout(timer);
  }, [position, idle]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        filter: "drop-shadow(0 0 5px #000)",
      }}
      ref={container}
    >
      <div
        className={styles.PetBounce}
        style={
          {
            top: position.y,
            left: position.x,
            position: "absolute",
            "--flip": velocity.x > 0 ? -1 : 1,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}

export default function PetDisplay({ pets }: PetDisplayProps) {
  return (
    <div className={styles.PetDisplay}>
      {pets.map((pet, index) => (
        <RandomMove key={index}>
          <Pet data={pet} style={{ width: PET_SIZE, height: PET_SIZE }} />
        </RandomMove>
      ))}
    </div>
  );
}
