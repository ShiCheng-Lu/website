import { useEffect, useRef, useState } from "react";
import Pet, { PetData } from "./Pet";
import styles from "./page.module.css";
import { Point, sub, abs, div, mul, add } from "@/util/point";

export type PetDisplayProps = {
  pets: PetData[];
};

const PET_SIZE = 60;

function RandomMove({ children }: { children: React.ReactElement }) {
  const fps = 60;

  const [position, setPosition] = useState(new Point(0, 0));
  const [target, setTarget] = useState(new Point(0, 0));
  const [velocity, setVelocity] = useState(new Point(0, 0));
  const [idle, setIdle] = useState(1);

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // update position
      const diff = sub(target, position);
      if (Math.abs(diff.x) < Math.abs(velocity.x)) {
        setPosition(add(position, velocity));
        return;
      }
      setPosition(target);

      setIdle(Math.random() * 10 + 5);
    }, 1 / fps);
    return () => clearTimeout(timer);
  }, [position]);

  return (
    <div style={{ width: "100%", height: "100%" }} ref={container}>
      <div
        className={styles.PetBounce}
        style={{
          top: position.y,
          left: position.x,
          position: "absolute",
        }}
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
