import { Euler, Vector3, Vector3Like } from "three";

export function coordinateToVector(latitude: number, longitude: number) {
  const ry = (longitude * Math.PI) / 180;
  const rx = (latitude * Math.PI) / 180;

  return new Vector3(0, 0, 1).applyEuler(new Euler(rx, ry, 0, "YXZ"));
}

export function vectorToCoordinate(vector: Vector3Like): {
  latitude: number;
  longitude: number;
} {
  if (vector.x === 0 && vector.z === 0) {
    return {
      latitude: vector.y >= 0 ? 90 : -90,
      longitude: 0,
    };
  }

  const longitude = (Math.atan2(vector.z, vector.x) * 180) / Math.PI;
  const base = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
  const latitude = (Math.atan2(vector.y, base) * 180) / Math.PI;

  return {
    latitude,
    longitude,
  };
}


