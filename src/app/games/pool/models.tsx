import { Euler, Vector3 } from "three";
import { BALL_DIAMETER, CUE_LENGTH, TABLE_WIDTH } from "./physics";

type Props = {
  position?: Vector3 | [number, number, number];
  rotation?: Euler | [number, number, number];
  scale?: Vector3 | number;
};

export function Ball({
  position,
  rotation,
  scale,
  color,
}: Props & { color: string }) {
  return (
    <mesh position={position} castShadow={true}>
      <sphereGeometry args={[BALL_DIAMETER / 2]} />
      <meshPhongMaterial color={color} />
    </mesh>
  );
}

export function Table() {
  return (
    <mesh>
      <mesh position={[0, 0, -BALL_DIAMETER / 2]}>
        <planeGeometry args={[TABLE_WIDTH, TABLE_WIDTH * 2]} />
        <meshStandardMaterial color="green" roughness={0.5} metalness={0.7} />
      </mesh>
    </mesh>
  );
}

export function Cue({ position, rotation }: Props) {
  return (
    <mesh position={position} rotation={rotation}>
      <mesh position={[0, -CUE_LENGTH / 2, 0]}>
        <cylinderGeometry args={[0.25, 0.5, CUE_LENGTH]} />
        <meshStandardMaterial color="#966F33" />
      </mesh>
    </mesh>
  );
}

export function Anchor({ position, rotation }: Props) {
  return (
    <mesh position={position} rotation={rotation}>
      <mesh>
        <sphereGeometry />
        <meshStandardMaterial color="#ecc6a9" />
      </mesh>
    </mesh>
  );
}
