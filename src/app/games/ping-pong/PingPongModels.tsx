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
        <meshStandardMaterial
          color="darkblue"
          roughness={0.5}
          metalness={0.7}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[6, 0.05, 1]} />
        <meshStandardMaterial color="white" />
      </mesh>
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
