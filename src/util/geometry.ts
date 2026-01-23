import { Quaternion, Vector3 } from "three";

export function circle(
  center: Vector3,
  radius: number,
  angle: number,
  rotation: Quaternion
) {
  const sections = 8;
  const points = [];
  for (let i = 0; i < sections + 1; ++i) {
    const a = ((angle * Math.PI) / 180) * i / sections;
    const p = new Vector3(Math.sin(a), Math.cos(a), 0);
    p.multiplyScalar(radius);
    p.applyQuaternion(rotation);
    p.add(center);
    points.push(p);
  }
  return points;
}
