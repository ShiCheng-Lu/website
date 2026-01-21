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
import { MeshGeometry } from "@/components/MeshGeometry";
import { circle } from "@/util/geometry";
import { StripGeometry } from "@/components/StripGeometry";

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
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
    </mesh>
  );
}

export function Table() {
  const meshes = useMemo(() => {
    const SQRT3 = Math.sqrt(3);
    // where cushion nose changes direction into the pocket, end
    const x1 = TABLE_WIDTH / 2 - CORNER_MOUTH * Math.SQRT1_2;
    const y1 = TABLE_WIDTH;
    const z1 = CUSHION_HEIGHT - BALL_RADIUS; // because ball is at 0, table is at -BALL_RADIUS
    const z2 = -BALL_RADIUS;
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

    // cushion bottom offset
    const cbo = CUSHION_HEIGHT / SQRT3;
    const cboc = Math.tan(((CORNER_ANGLE - 90) * Math.PI) / 180) * cbo;
    const cbos = Math.tan(((SIDE_ANGLE - 90) * Math.PI) / 180) * cbo;

    const flipX = (p: Vector3) => new Vector3(-p.x, p.y, p.z);
    const flipY = (p: Vector3) => new Vector3(p.x, -p.y, p.z);
    const flipXY = (p: Vector3) => new Vector3(-p.x, -p.y, p.z);

    const cushion: Vector3[][] = (() => {
      const mesh: Vector3[][] = [];
      const end: Vector3[] = [
        new Vector3(-x1, y1, z1),
        new Vector3(x1, y1, z1),
        new Vector3(x2, y2, z1),
        new Vector3(-x2, y2, z1),
      ];
      mesh.push(end);
      mesh.push(end.map(flipY).toReversed());

      const endbot: Vector3[] = [
        new Vector3(x1, y1, z1),
        new Vector3(-x1, y1, z1),
        new Vector3(-x1 - cboc, y1 + cbo, z2),
        new Vector3(x1 + cboc, y1 + cbo, z2),
      ];
      mesh.push(endbot);
      mesh.push(endbot.map(flipY).toReversed());

      // all these have 4 fold symmetry
      const corner1: Vector3[] = [
        new Vector3(x1, y1, z1),
        new Vector3(x1 + cboc, y1 + cbo, z2),
        new Vector3(x2, y2, z2),
        new Vector3(x2, y2, z1),
      ];
      const corner2: Vector3[] = [
        new Vector3(x3, y3, z1),
        new Vector3(x4, y4, z1),
        new Vector3(x4, y4, z2),
        new Vector3(x3 + cbo, y3 + cboc, z2),
      ];
      const side: Vector3[] = [
        new Vector3(x3, y3, z1),
        new Vector3(x3, y5, z1),
        new Vector3(x4, y6, z1),
        new Vector3(x4, y4, z1),
      ];
      const sidebot: Vector3[] = [
        new Vector3(x3, y3, z1),
        new Vector3(x3 + cbo, y3 + cboc, z2),
        new Vector3(x3 + cbo, y5 - cbos, z2),
        new Vector3(x3, y5, z1),
      ];
      const side1: Vector3[] = [
        new Vector3(x3, y5, z1),
        new Vector3(x3 + cbo, y5 - cbos, z2),
        new Vector3(x4, y6, z2),
        new Vector3(x4, y6, z1),
      ];
      for (const m of [corner1, corner2, side, sidebot, side1]) {
        mesh.push(m);
        mesh.push(m.map(flipY).toReversed());
        mesh.push(m.map(flipX).toReversed());
        mesh.push(m.map(flipXY));
      }

      return mesh;
    })();

    const edge_corner =
      POCKET_DIMENSIONS.corner + POCKET_DIMENSIONS.back * Math.SQRT1_2;

    const outside_circle = circle(
      new Vector3(TABLE_WIDTH / 2 + edge_corner, TABLE_WIDTH + edge_corner, z1),
      CUSHION_WIDTH + EDGE_WIDTH - edge_corner,
      90,
      new Quaternion()
    );

    const corner_back = circle(
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
    );

    const side_back = circle(
      new Vector3(TABLE_WIDTH / 2 + POCKET_DIMENSIONS.side, 0, z1),
      POCKET_DIMENSIONS.back,
      180 - SIDE_ANGLE,
      new Quaternion().setFromAxisAngle(
        { x: 0, y: 0, z: 1 },
        ((90 - SIDE_ANGLE) * Math.PI) / 180
      )
    );

    const table: Vector3[][] = (() => {
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
        ...corner_back,
        new Vector3(x4, y4, z1),
        ...outside_circle.toReversed(),
      ];

      mesh.push(corner);
      mesh.push(corner.map(flipY).toReversed());
      mesh.push(corner.map(flipX).toReversed());
      mesh.push(corner.map(flipXY));

      const side: Vector3[] = [
        new Vector3(x4, y4, z1),
        new Vector3(x4, y6, z1),
        ...side_back,
        new Vector3(TABLE_WIDTH / 2 + CUSHION_WIDTH + EDGE_WIDTH, 0, z1),
        new Vector3(
          TABLE_WIDTH / 2 + CUSHION_WIDTH + EDGE_WIDTH,
          TABLE_WIDTH +
            POCKET_DIMENSIONS.corner +
            POCKET_DIMENSIONS.back * Math.SQRT1_2,
          z1
        ),
      ];
      mesh.push(side);
      mesh.push(side.map(flipY).toReversed());
      mesh.push(side.map(flipX).toReversed());
      mesh.push(side.map(flipXY));

      return mesh;
    })();

    const table_edge = (() => {
      const circle_normal = circle(new Vector3(), 1, 90, new Quaternion());

      const a = [
        ...outside_circle,
        ...outside_circle.map(flipY).toReversed(),
        ...outside_circle.map(flipXY),
        ...outside_circle.map(flipX).toReversed(),
        outside_circle[0].clone(),
      ];
      const n = [
        ...circle_normal,
        ...circle_normal.map(flipY).toReversed(),
        ...circle_normal.map(flipXY),
        ...circle_normal.map(flipX).toReversed(),
        circle_normal[0].clone(),
      ];
      const b = a.map((p) => new Vector3(p.x, p.y, p.z - 12));
      return {
        a,
        an: n,
        b,
        bn: n,
      };
    })();

    const cusion_back = (() => {
      const corner_normal = circle(
        new Vector3(),
        1,
        (225 - CORNER_ANGLE) * 2,
        new Quaternion().setFromAxisAngle(
          { x: 0, y: 0, z: 1 },
          ((180 - CORNER_ANGLE) * Math.PI) / 180
        )
      ).map((p) => p.multiplyScalar(-1));
      const side_normal = circle(
        new Vector3(),
        1,
        180 - SIDE_ANGLE,
        new Quaternion().setFromAxisAngle(
          { x: 0, y: 0, z: 1 },
          ((90 - SIDE_ANGLE) * Math.PI) / 180
        )
      ).map((p) => p.multiplyScalar(-1));

      const corner_a = [
        new Vector3(x2, y2, z1),
        ...corner_back,
        new Vector3(x4, y4, z1),
      ];
      const corner_n = [
        corner_normal[0],
        ...corner_normal,
        corner_normal[corner_normal.length - 1],
      ];
      const corner_b = corner_a.map((p) => new Vector3(p.x, p.y, -BALL_RADIUS));

      const side_a = [
        new Vector3(x4, y6, z1),
        ...side_back,
        ...side_back.slice(0, -1).map(flipY).toReversed(),
        new Vector3(x4, -y6, z1),
      ];
      const side_n = [
        side_normal[0],
        ...side_normal,
        ...side_normal.slice(0, -1).map(flipY).toReversed(),
        side_normal[0].clone().multiply({ x: 1, y: -1, z: 1 }),
      ];
      const side_b = side_a.map((p) => new Vector3(p.x, p.y, -BALL_RADIUS));

      const pockets = [];
      for (const x of [-1, 1]) {
        for (const y of [-1, 1]) {
          const a = corner_a.map((p) => new Vector3(p.x * x, p.y * y, p.z));
          const an = corner_n.map((p) => new Vector3(p.x * x, p.y * y, p.z));
          const b = corner_b.map((p) => new Vector3(p.x * x, p.y * y, p.z));
          const bn = corner_n.map((p) => new Vector3(p.x * x, p.y * y, p.z));

          if (x * y === 1) {
            a.reverse();
            an.reverse();
            b.reverse();
            bn.reverse();
          }
          pockets.push({ a, an, b, bn });
        }
      }
      pockets.push({
        a: side_a.toReversed(),
        an: side_n.toReversed(),
        b: side_b.toReversed(),
        bn: side_n.toReversed(),
      });
      pockets.push({
        a: side_a.map(flipX),
        an: side_n.map(flipX),
        b: side_b.map(flipX),
        bn: side_n.map(flipX),
      });

      return pockets;
    })();

    return {
      cushion,
      table,
      table_edge,
      cusion_back,
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
        <meshStandardMaterial color="green" roughness={0.7} metalness={0.2} />
      </mesh>
      {POCKETS.map((pocket, index) => (
        <mesh
          position={pocket.clone().sub({ x: 0, y: 0, z: BALL_RADIUS - 0.01 })}
          key={index}
        >
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
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      <mesh>
        <MeshGeometry faces={meshes.table} />
        <meshStandardMaterial color="#966F33" roughness={0.7} metalness={0} />
      </mesh>
      <mesh>
        <StripGeometry strip={meshes.table_edge} />
        <meshStandardMaterial color="#966F33" roughness={1} metalness={0} />
      </mesh>
      {meshes.cusion_back.map((strip, i) => (
        <mesh key={i}>
          <StripGeometry strip={strip} />
          <meshStandardMaterial color="#966F33" roughness={1} metalness={0} />
        </mesh>
      ))}
    </mesh>
  );
}

export function Cue({ position, rotation }: Props) {
  return (
    <mesh position={position} rotation={rotation}>
      <mesh position={[0, -CUE_LENGTH / 2, 1]}>
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
