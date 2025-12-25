import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Euler, Vector3 } from "three";

export default function Camera({
  fov,
  position,
  rotation,
}: {
  fov?: number;
  position?: Vector3 | [number, number, number];
  rotation?: Euler | [number, number, number];
}) {
  const { camera } = useThree();

  const pos = Array.isArray(position)
    ? new Vector3(position[0], position[1], position[2])
    : position;

  const rot = Array.isArray(rotation)
    ? new Euler(rotation[0], rotation[1], rotation[2])
    : rotation;

  useEffect(() => {
    console.log("updated camera");

    (camera as any).fov = fov;
    pos && camera.position.set(pos.x, pos.y, pos.z);
    rot && camera.rotation.set(rot.x, rot.y, rot.z, rot.order);
    camera.updateProjectionMatrix();
  }, [fov, pos?.x, pos?.y, pos?.z, rot?.x, rot?.y, rot?.z]);

  return null;
}
