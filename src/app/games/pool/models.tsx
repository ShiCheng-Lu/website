import { Euler, Vector3 } from "three";
import {
  BALL_DIAMETER,
  CORNER_ANGLE,
  CORNER_MOUTH,
  CUE_LENGTH,
  CUSHION_HEIGHT,
  CUSHION_WIDTH,
  EDGE_WIDTH,
  POCKETS,
  POCKET_DIMENSIONS,
  SIDE_ANGLE,
  SIDE_MOUTH,
  TABLE_WIDTH,
  radians,
} from "./physics";
import { useMemo } from "react";
import { join } from "path";

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
  const cushions = useMemo(() => {
    // where cushion nose changes direction into the pocket, end
    const x1 = TABLE_WIDTH / 2 - CORNER_MOUTH * Math.SQRT1_2;
    const y1 = TABLE_WIDTH;
    const z1 = CUSHION_HEIGHT - BALL_DIAMETER / 2;
    // end of the 2 inch cushion
    const corner_offset = Math.tan(radians(CORNER_ANGLE - 90)) * CUSHION_WIDTH;
    const x2 = x1 + corner_offset;
    const y2 = y1 + CUSHION_WIDTH;
    // where cushion nose changes direction into the pocket, side
    const x3 = TABLE_WIDTH / 2;
    const y3 = TABLE_WIDTH - CORNER_MOUTH * Math.SQRT1_2;

    const x4 = x3 + CUSHION_WIDTH;
    const y4 = y3 + corner_offset;

    const y5 = SIDE_MOUTH / 2;
    const y6 = y5 - Math.tan(radians(SIDE_ANGLE - 90)) * CUSHION_WIDTH;

    /* prettier-ignore */
    const points = new Float32Array([
      // top
      -x1, y1, z1,
      x1, y1, z1,
      -x2, y2, z1,
      x2, y2, z1,
      // bottom
      -x1, -y1, z1,
      x1, -y1, z1,
      -x2, -y2, z1,
      x2, -y2, z1,
      // left top
      -x3, y3, z1,
      -x4, y4, z1,
      -x3, y5, z1,
      -x4, y6, z1,
      // left bottom
      -x3, -y3, z1,
      -x4, -y4, z1,
      -x3, -y5, z1,
      -x4, -y6, z1,
      // right top
      x3, y3, z1,
      x4, y4, z1,
      x3, y5, z1,
      x4, y6, z1,
      // left top
      x3, -y3, z1,
      x4, -y4, z1,
      x3, -y5, z1,
      x4, -y6, z1,
    ]);

    /* prettier-ignore */
    const normals = new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ])

    /* prettier-ignore */
    const indices = new Uint16Array([
      0, 1, 2,
      3, 2, 1,

      6, 5, 4, 
      5, 6, 7,

      8, 9, 10,
      11, 10, 9,

      14, 13, 12,
      13, 14, 15,

      18, 17, 16,
      17, 18, 19,

      20, 21, 22,
      23, 22, 21,
    ]);
    return {
      points,
      normals,
      indices,
    };
  }, []);

  return (
    <mesh>
      {/* TEMP, outer edge of table */}
      <mesh position={[0, 0, -BALL_DIAMETER / 2]}>
        <planeGeometry
          args={[
            TABLE_WIDTH + (CUSHION_WIDTH + EDGE_WIDTH) * 2,
            TABLE_WIDTH * 2 + (CUSHION_WIDTH + EDGE_WIDTH) * 2,
          ]}
        />
        <meshStandardMaterial color="#966F33" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, -BALL_DIAMETER / 2]}>
        <planeGeometry
          args={[
            TABLE_WIDTH + CUSHION_WIDTH * 2,
            TABLE_WIDTH * 2 + CUSHION_WIDTH * 2,
          ]}
        />
        <meshStandardMaterial color="green" roughness={0.5} metalness={0.7} />
      </mesh>
      {POCKETS.map((pocket, index) => (
        <mesh position={pocket} key={index}>
          <circleGeometry args={[POCKET_DIMENSIONS.hole]} />
          <meshStandardMaterial color="black" />
        </mesh>
      ))}
      {/* cushions */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[cushions.points, 3]}
          />
          <bufferAttribute
            attach="attributes-normal"
            args={[cushions.normals, 3]}
          />
          <bufferAttribute attach="index" args={[cushions.indices, 1]} />
        </bufferGeometry>
        <meshStandardMaterial
          color="darkgreen"
          roughness={0.5}
          metalness={0.7}
        />
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
      {/* pinky */}
      <mesh position={[-2.3, -0.4, 0]} rotation={[0, 0, 0.5]}>
        <capsuleGeometry args={[0.3, 2.5]} />
        <meshStandardMaterial color="#ecc6a9" />
      </mesh>
      {/* ring */}
      <mesh position={[-1.6, -0.1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.3, 3]} />
        <meshStandardMaterial color="#ecc6a9" />
      </mesh>
      {/* middle */}
      <mesh position={[-0.8, 0, 0]} rotation={[0, 0, 0.0]}>
        <capsuleGeometry args={[0.3, 3.2]} />
        <meshStandardMaterial color="#ecc6a9" />
      </mesh>
      {/* index */}
      <mesh position={[0, -0.2, -0.1]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.3, 3]} />
        <meshStandardMaterial color="#ecc6a9" />
      </mesh>
      {/* thumb */}
      <mesh position={[0.2, -1, -0.1]} rotation={[0, 0, -0.8]}>
        <capsuleGeometry args={[0.3, 1.5]} />
        <meshStandardMaterial color="#ecc6a9" />
      </mesh>
      {/* palm */}
      <mesh position={[-1, -2, -0.3]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[2, 2]} />
        <meshStandardMaterial color="#ecc6a9" />
      </mesh>
    </mesh>
  );
}
