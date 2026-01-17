import { Euler, Quaternion, Vector2, Vector3 } from "three";
import {
  BALL_DIAMETER,
  BALL_RADIUS,
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
import { MeshGeometry } from "@/components/MeshGeometry";
import { circle } from "@/util/geometry";

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
  const meshes = useMemo(() => {
    // where cushion nose changes direction into the pocket, end
    const x1 = TABLE_WIDTH / 2 - CORNER_MOUTH * Math.SQRT1_2;
    const y1 = TABLE_WIDTH;
    const z1 = CUSHION_HEIGHT - BALL_RADIUS; // because ball is at 0, table is at -BALL_RADIUS
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

    const x5 =
      TABLE_WIDTH / 2 +
      POCKET_DIMENSIONS.corner +
      POCKET_DIMENSIONS.back * Math.SQRT1_2;
    const y7 = y2 + EDGE_WIDTH;

    const flipX = (p: Vector3) => new Vector3(-p.x, p.y, p.z);
    const flipY = (p: Vector3) => new Vector3(p.x, -p.y, p.z);
    const flipXY = (p: Vector3) => new Vector3(-p.x, -p.y, p.z);

    const cushion: Vector3[][] = useMemo(() => {
      const mesh: Vector3[][] = [];
      const end: Vector3[] = [
        new Vector3(-x1, y1, z1),
        new Vector3(x1, y1, z1),
        new Vector3(x2, y2, z1),
        new Vector3(-x2, y2, z1),
      ];
      mesh.push(end);
      mesh.push(end.map(flipY).toReversed());
      const side: Vector3[] = [
        new Vector3(x3, y3, z1),
        new Vector3(x3, y5, z1),
        new Vector3(x4, y6, z1),
        new Vector3(x4, y4, z1),
      ];
      mesh.push(side);
      mesh.push(side.map(flipY).toReversed());
      mesh.push(side.map(flipX).toReversed());
      mesh.push(side.map(flipXY));
      return mesh;
    }, []);

    const table: Vector3[][] = useMemo(() => {
      const mesh: Vector3[][] = [];
      const end: Vector3[] = [
        new Vector3(-x2, y2, z1),
        new Vector3(x2, y2, z1),
        new Vector3(x5, y7, z1),
        new Vector3(-x5, y7, z1),
      ];
      mesh.push(end);
      mesh.push(end.map((p) => new Vector3(p.x, -p.y, p.z)).toReversed());

      const corner: Vector3[] = [
        new Vector3(x2, y2, z1),
        ...circle(
          new Vector3(
            TABLE_WIDTH / 2 + POCKET_DIMENSIONS.corner,
            TABLE_WIDTH + POCKET_DIMENSIONS.corner,
            z1
          ),
          POCKET_DIMENSIONS.back,
          (225 - CORNER_ANGLE) * 2,
          new Quaternion().setFromAxisAngle(
            { x: 0, y: 0, z: 1 },
            ((180 - CORNER_ANGLE) * Math.PI) / 180
          )
        ),
        new Vector3(x4, y4, z1),
        // ...circle(
        //   new Vector3(
        //     TABLE_WIDTH / 2 + POCKET_DIMENSIONS.corner + POCKET_DIMENSIONS.back * Math.SQRT1_2,
        //     TABLE_WIDTH + POCKET_DIMENSIONS.corner + POCKET_DIMENSIONS.back * Math.SQRT1_2,
        //     z1,
        //   )
        // )
      ];
      mesh.push(corner.toReversed());
      mesh.push(corner.map(flipY));
      mesh.push(corner.map(flipX));
      mesh.push(corner.map(flipXY).toReversed());

      return mesh;
    }, []);

    return {
      cushion,
      table,
    };
  }, []);

  return (
    <mesh>
      {/* TEMP, outer edge of table */}
      {/* <mesh position={[0, 0, -BALL_DIAMETER / 2]} receiveShadow={true}>
        <planeGeometry
          args={[
            TABLE_WIDTH + (CUSHION_WIDTH + EDGE_WIDTH) * 2,
            TABLE_WIDTH * 2 + (CUSHION_WIDTH + EDGE_WIDTH) * 2,
          ]}
        />
        <meshStandardMaterial color="#966F33" roughness={0.5} metalness={0.7} />
      </mesh> */}
      <mesh position={[0, 0, -BALL_DIAMETER / 2]} receiveShadow={true}>
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
      {/* <mesh>
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
      </mesh> */}
      <mesh>
        <MeshGeometry faces={meshes.cushion} />
        <meshStandardMaterial
          color="darkgreen"
          roughness={0.5}
          metalness={0.7}
        />
      </mesh>
      <mesh>
        <MeshGeometry faces={meshes.table} />
        <meshStandardMaterial color="#966F33" roughness={0.5} metalness={0.7} />
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
