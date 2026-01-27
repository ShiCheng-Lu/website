import { useMemo } from "react";
import { Geometry } from "./icosahedron";

export default function MeshGeometry2({
  vertices,
  normals,
  indices,
}: Geometry) {
  const { p, n, i } = useMemo(() => {
    return {
      p: new Float32Array(vertices.flatMap((v) => [v.x, v.y, v.z])),
      n: new Float32Array(normals.flatMap((n) => [n.x, n.y, n.z])),
      i: new Uint16Array(indices.flatMap((i) => [i.x, i.y, i.z])),
    };
  }, [vertices, normals, indices]);

  return (
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[p, 3]} />
      <bufferAttribute attach="attributes-normal" args={[n, 3]} />
      <bufferAttribute attach="index" args={[i, 1]} />
    </bufferGeometry>
  );
}
