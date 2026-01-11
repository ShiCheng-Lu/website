import { Euler, Vector3 } from "three";
import { BALL_DIAMETER, TABLE_WIDTH } from "./physics";

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
      <mesh>
        <planeGeometry args={[TABLE_WIDTH, TABLE_WIDTH * 2]} />
        <meshStandardMaterial color="green" roughness={0.5} metalness={0.7} />
      </mesh>
    </mesh>
  );
}
