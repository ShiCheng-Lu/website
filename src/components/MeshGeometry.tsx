import { useMemo } from "react";
import { Vector2, Vector3 } from "three";

type MeshGeometryProps = {
  faces: Vector3[][];
};

export function MeshGeometry({ faces }: MeshGeometryProps) {
  const { points, normals, indices } = useMemo(() => {
    const points: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (const face of faces) {
      const normal = face[0].clone().cross(face[1]);
      const perim = [];
      // indices sorted by x
      //

      for (let i = 0; i < face.length; ++i) {
        const p = face[i];
        // const n = normals ? normals[i] : normal;
        const n = normal;
        points.push(p.x, p.y, p.z);
        normals.push(n.x, n.y, n.z);

        perim.push(new Vector2(p.x, p.y)); // TODO: project onto the plane via normal
      }
      // partition into monotone polygons
      const polygon = new Array(face.length).fill(0).map((_, i) => i);

      // triangulate monotone polygons

    }

    return {
      points: new Float32Array(points),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices),
    };
  }, []);

  return (
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[points, 3]} />
      <bufferAttribute attach="attributes-normal" args={[normals, 3]} />
      <bufferAttribute attach="index" args={[indices, 1]} />
    </bufferGeometry>
  );
}
