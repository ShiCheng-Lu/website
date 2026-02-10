import { Line } from "@/util/three";
import { Vector3 } from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { ThreeElement, extend } from "@react-three/fiber";
import { Fragment } from "react";

extend({ TextGeometry });
declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: ThreeElement<typeof TextGeometry>;
  }
}

export function Board({ font }: { font: Font }) {
  const river = "楚河 漢界";
  return (
    <mesh>
      <mesh>
        <planeGeometry args={[20, 22]} />
        <meshStandardMaterial color="tan" />
      </mesh>
      {/* Vertical */}
      {[-6, -4, -2, 0, 2, 4, 6].map((x, i) => (
        <Fragment key={i}>
          <Line
            key={`v${i}b`}
            line={[new Vector3(x, -9, 0), new Vector3(x, -1, 0)]}
            color="black"
          />
          <Line
            key={`v${i}t`}
            line={[new Vector3(x, 1, 0), new Vector3(x, 9, 0)]}
            color="black"
          />
        </Fragment>
      ))}
      {/* Sidelines */}
      <Line
        line={[new Vector3(-8, -9, 0), new Vector3(-8, 9, 0)]}
        color="black"
      />
      <Line
        line={[new Vector3(8, -9, 0), new Vector3(8, 9, 0)]}
        color="black"
      />
      {/* Horizontal */}
      {[-9, -7, -5, -3, -1, 1, 3, 5, 7, 9].map((y, i) => (
        <Line
          key={`h${i}`}
          line={[new Vector3(-8, y, 0), new Vector3(8, y, 0)]}
          color="black"
        />
      ))}
      {/* X */}
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([x, y], i) => (
        <Line
          key={`x${i}`}
          line={[new Vector3(-2 * x, 9 * y, 0), new Vector3(2 * x, 5 * y, 0)]}
          color="black"
        />
      ))}
      {/* River */}
      <mesh position={[-4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <textGeometry
          args={["楚\n河", { font, size: 0.8, depth: 0.001 }]}
          onUpdate={(self) => self.center()}
        />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[4, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <textGeometry
          args={["漢\n界", { font, size: 0.8, depth: 0.001 }]}
          onUpdate={(self) => self.center()}
        />
        <meshStandardMaterial color="black" />
      </mesh>
    </mesh>
  );
}

type PieceProps = {
  font: Font;
  position: Vector3;
  text: string;
  color: string;
  textColor: string;
};
export function Piece({ font, position, text, color, textColor }: PieceProps) {
  const radius = 0.8;
  return (
    <mesh position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.15]}>
        <cylinderGeometry args={[radius, radius, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <textGeometry
          args={[text, { font, size: 0.7, depth: 0.001 }]}
          onUpdate={(self) => self.center()}
        />
        <meshStandardMaterial color={textColor} />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <ringGeometry args={[radius - 0.05, radius, 32]} />
        <meshStandardMaterial color={textColor} />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <ringGeometry args={[radius - 0.15, radius - 0.1, 32]} />
        <meshStandardMaterial color={textColor} />
      </mesh>
    </mesh>
  );
}
