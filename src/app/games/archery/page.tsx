"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { PerspectiveCamera } from "@react-three/drei";

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
  const [velocity, setVelocity] = useState(new Vector3(0));
  const [checkTarget, setCheckTarget] = useState(false);

  const fps = 60;
  const distance = 18; // or 25
  const arrow_length = 0.75;
  const arrow_diameter = 0.0065;

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
      }
      console.log(position);
    }, 1000 / fps);
    return () => clearTimeout(timeout);
  }, [velocity, position]);

  const onClick = (e: React.MouseEvent) => {
    if (checkTarget) {
      // cannot shoot if we're checking the target
      return;
    }
    if (position.z < -2) {
      setPosition(new Vector3(0, -0.05, 0));
      setVelocity(new Vector3(0));
    } else {
      setVelocity(new Vector3(0, 2, -50));
    }
  };

  return (
    <div>
      <button onClick={() => setCheckTarget(!checkTarget)}>Check</button>
      <div
        style={{ height: "100%", width: "100%", position: "fixed" }}
        onClick={onClick}
      >
        <Canvas
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
          <mesh
            position={[0, 0, -distance]}
            rotation={[-((10 / 180) * Math.PI), 0, 0]}
            scale={0.4 / 5}
          >
            {["yellow", "red", "blue", "black", "white"].map((color, index) => {
              const ringColor = color == "black" ? "white" : "black";
              return (
                <mesh key={index}>
                  {/* inner ring */}
                  <mesh>
                    <ringGeometry args={[index, index + 0.45, 64, 1]} />
                    <meshStandardMaterial color={color} />
                  </mesh>
                  <mesh>
                    <ringGeometry args={[index + 0.45, index + 0.5, 64, 1]} />
                    <meshStandardMaterial color={ringColor} />
                  </mesh>
                  {/* outer ring */}
                  <mesh>
                    <ringGeometry args={[index + 0.5, index + 0.95, 64, 1]} />
                    <meshStandardMaterial color={color} />
                  </mesh>
                  <mesh>
                    <ringGeometry args={[index + 0.95, index + 1, 64, 1]} />
                    <meshStandardMaterial color={"black"} />
                  </mesh>
                </mesh>
              );
            })}
          </mesh>

          {/* Arrow */}
          <mesh
            position={position}
            // position={[0, -0.6, -1]}
            // rotation={[Math.PI / 2, 0, 0]}
          >
            <mesh
              position={[0, 0, -arrow_length / 2]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry
                args={[arrow_diameter, arrow_diameter, arrow_length, 32]}
              />
              <meshStandardMaterial color={"sienna"} metalness={0.5} />
            </mesh>
            <mesh
              position={[0, 0, -arrow_length + arrow_diameter]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry
                args={[
                  arrow_diameter * 1.1,
                  arrow_diameter * 1.1,
                  arrow_diameter * 3,
                  32,
                ]}
              />
              <meshStandardMaterial color={"gray"} metalness={0.5} />
            </mesh>
            {[1.1, 0.9, 0.7, 0.4, 0].map((width, index, array) => {
              const prev = index == 0 ? 0 : array[index - 1];
              const position: any = [
                0,
                0,
                -arrow_length - index * arrow_diameter,
              ];
              const rotation: any = [-Math.PI / 2, 0, 0];
              return (
                <mesh
                  position={position}
                  rotation={rotation}
                  key={index}
                  scale={arrow_diameter}
                >
                  <cylinderGeometry args={[width, prev, 1, 16, 1, true]} />
                  <meshStandardMaterial color={"gray"} metalness={0.5} />
                </mesh>
              );
            })}
          </mesh>

          {/* Sight */}
          <mesh></mesh>
        </Canvas>
      </div>
    </div>
  );
}
