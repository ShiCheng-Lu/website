import { Quaternion, Vector2, Vector3 } from "three";

/**
 * expect first point to be the same as last point for ease of iteration
 */
export type Polygon = Vector2[];

export function circle(
  center: Vector3,
  radius: number,
  angle: number,
  rotation: Quaternion
) {
  const sections = 8;
  const points = [];
  for (let i = 0; i < sections + 1; ++i) {
    const a = (((angle * Math.PI) / 180) * i) / sections;
    const p = new Vector3(Math.sin(a), Math.cos(a), 0);
    p.multiplyScalar(radius);
    p.applyQuaternion(rotation);
    p.add(center);
    points.push(p);
  }
  return points;
}

export function lerp<T extends Vector2 | Vector3>(a: T, b: T, v: number): T {
  const c0 = a.clone().multiplyScalar(1 - v);
  const c1 = b.clone().multiplyScalar(v);
  // c0 and c1 are guranteed to be the same type, but typescript thinks c1 could be
  // either Vector2 or Vector3 and not be the same as c0, so cast to any is necessary
  return c0.add(c1 as any) as T;
}

export { default as MeshGeometry2 } from "./mesh";
export { default as triangulation } from "./triangulation";
export { coordinateToVector, vectorToCoordinate } from "./coordinates";
