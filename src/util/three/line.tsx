import { useEffect, useRef } from "react";
import { Vector3 } from "three";

export function Line({ line, color }: { line: Vector3[]; color: string }) {
  const ref = useRef<any>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.geometry.setFromPoints(line);
    }
  }, [line]);
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color={color} />
    </line>
  );
}
