"use client";

import { triangulation } from "@/util/geometry";
import { toIndices } from "@/util/geometry/triangulation";
import { useMemo } from "react";
import { Quaternion, Vector2, Vector3 } from "three";

type MeshGeometryProps = {
  faces: Vector3[][];
};

export function MeshGeometry({ faces }: MeshGeometryProps) {
  const { points, normals, indices } = useMemo(() => {
    const points: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (const face of faces) {
      if (face.length < 3) {
        continue;
      }
      if (!face[face.length - 1].equals(face[0])) {
        face.push(face[0]);
      }

      const indexOffset = points.length / 3;
      const polygon: Vector2[] = [];
      const normal = face[face.length - 1].clone().cross(face[0]);
      for (let i = 0; i < face.length - 1; ++i) {
        normal.add(face[i].clone().cross(face[i + 1]));
      }
      normal.normalize();
      const normalizingRotation = new Quaternion().setFromUnitVectors(
        normal,
        new Vector3(0, 0, 1)
      );

      for (let i = 0; i < face.length; ++i) {
        const p = face[i];
        const n = normal;
        points.push(p.x, p.y, p.z);
        normals.push(n.x, n.y, n.z);

        const normalized = face[i].clone().sub(face[0]);
        normalized.applyQuaternion(normalizingRotation);
        polygon.push(new Vector2(normalized.x, normalized.y));
      }

      const triangles = triangulation(polygon);
      // console.log(triangles);
      indices.push(
        ...toIndices(polygon, triangles.flat()).map((x) => x + indexOffset)
      );
    }

    return {
      points: new Float32Array(points),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices),
    };
  }, [faces]);

  return (
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[points, 3]} />
      <bufferAttribute attach="attributes-normal" args={[normals, 3]} />
      <bufferAttribute attach="index" args={[indices, 1]} />
    </bufferGeometry>
  );
}
