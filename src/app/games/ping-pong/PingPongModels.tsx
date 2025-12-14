import { Euler, Vector3 } from "three";

type Props = {
  position?: Vector3 | [number, number, number];
  rotation?: Euler | [number, number, number];
  scale?: Vector3 | number;
};

export function Table({ position, rotation, scale }: Props) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <mesh>
        <planeGeometry args={[5, 9]} />
        <meshStandardMaterial color="white" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh>
        <planeGeometry args={[4.9, 8.9]} />
        <meshStandardMaterial
          color="darkblue"
          roughness={0.5}
          metalness={0.7}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[0.02, 9]} />
        <meshStandardMaterial color="white" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* net */}
      <mesh>
        <boxGeometry args={[6, 0.05, 0.5]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* posts */}
      <mesh position={[-3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </mesh>
  );
}

export function Paddle({ position, rotation, scale }: Props) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <mesh>
        <circleGeometry args={[0.25]} />
        <meshStandardMaterial color="red" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.3]} />
        <meshStandardMaterial color={"#966F33"} />
      </mesh>
    </mesh>
  );
}
