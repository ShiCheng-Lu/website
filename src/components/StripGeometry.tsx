import { useMemo } from "react";
import { Vector3 } from "three";

type StripGeometryProp = {
  strip: {
    a: Vector3[];
    an: Vector3[];
    b: Vector3[];
    bn: Vector3[];
  };
};
export function StripGeometry({ strip }: StripGeometryProp) {
  const { points, normals, indices } = useMemo(() => {
    const points: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const { a, an, b, bn } = strip;

    if (
      a.length != an.length ||
      b.length != bn.length ||
      a.length != b.length
    ) {
      return {
        points: new Float32Array(points),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices),
      };
    }

    const length = a.length;
    let i;
    for (i = 0; i < length - 1; ++i) {
      points.push(a[i].x, a[i].y, a[i].z);
      points.push(b[i].x, b[i].y, b[i].z);
      normals.push(an[i].x, an[i].y, an[i].z);
      normals.push(bn[i].x, bn[i].y, bn[i].z);

      // a[i] - b[i] - a[i + 1] triangle
      indices.push(2 * i + 2, 2 * i + 1, 2 * i + 0);
      // b[i] - a[i + 1] - b[i + 1] triangle
      indices.push(2 * i + 1, 2 * i + 2, 2 * i + 3);
    }

    i = length - 1; // last item
    points.push(a[i].x, a[i].y, a[i].z);
    points.push(b[i].x, b[i].y, b[i].z);
    normals.push(an[i].x, an[i].y, an[i].z);
    normals.push(bn[i].x, bn[i].y, bn[i].z);

    return {
      points: new Float32Array(points),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices),
    };
  }, [strip]);

  return (
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[points, 3]} />
      <bufferAttribute attach="attributes-normal" args={[normals, 3]} />
      <bufferAttribute attach="index" args={[indices, 1]} />
    </bufferGeometry>
  );
}
