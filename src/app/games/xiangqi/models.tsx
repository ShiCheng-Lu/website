import { Line } from "@/util/three";
import { Vector3 } from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { extend } from "@react-three/fiber";

extend({ TextGeometry });

export function Board() {



  return (
    <mesh>
      <mesh>
        <planeGeometry args={[20, 22]} />
        <meshStandardMaterial color="tan" />
      </mesh>
      {[-6, -4, -2, 0, 2, 4, 6].map((x, i) => <>
        <Line key={`v${i}b`} line={[
          new Vector3(x, -9, 0),
          new Vector3(x, -1, 0),
        ]} color="black" />
        <Line key={`v${i}t`} line={[
          new Vector3(x, 1, 0),
          new Vector3(x, 9, 0),
        ]} color="black" />
      </>)}
      <Line line={[
        new Vector3(-8, -9, 0),
        new Vector3(-8, 9, 0),
      ]} color="black" />
      <Line line={[
        new Vector3(8, -9, 0),
        new Vector3(8, 9, 0),
      ]} color="black" />
      {[-9, -7, -5, -3, -1, 1, 3, 5, 7, 9].map((y, i) =>
        <Line key={`h${i}`} line={[
          new Vector3(-8, y, 0),
          new Vector3(8, y, 0),
        ]} color="black" />
      )}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], i) =>
        <Line key={`x${i}`} line={[
          new Vector3(-2 * x, 9 * y, 0),
          new Vector3(2 * x, 5 * y, 0),
        ]} color="black" />
      )}
    </mesh>
  );
}

export function Text({ font, position, text }: { font: Font, position: Vector3, text: string }) {
  
  return (
    <mesh position={position}>
      <textGeometry args={[text, { font, size: 0.7, depth: 0.001 }]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
}

export function Piece({ font, position, text }: { font: Font, position: Vector3, text: string }) {
  return (
    <mesh position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.8, 0.8, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[-0.45, -0.4, 0.5]}>
        <textGeometry args={[text, { font, size: 0.7, depth: 0.001 }]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </mesh>
  );
}
