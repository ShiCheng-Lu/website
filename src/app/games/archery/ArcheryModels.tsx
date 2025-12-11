import { Shape } from "three";

export type TargetProps = {
  distance: number;
};

export function Target({ distance }: TargetProps) {
  return (
    <mesh
      position={[0, 0, -distance]}
      rotation={[-((0 / 180) * Math.PI), 0, 0]}
    >
      {["yellow", "red", "blue", "black", "white"].map((color, index) => {
        const ringColor = color == "black" ? "white" : "black";
        return (
          <mesh key={index} scale={0.4 / 5}>
            {/* inner ring */}
            <mesh>
              <ringGeometry args={[index, index + 0.45, 64, 1]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh>
              <ringGeometry args={[index + 0.45, index + 0.5, 64, 1]} />
              <meshStandardMaterial color={ringColor} />
            </mesh>
            {/* outer ring */}
            <mesh>
              <ringGeometry args={[index + 0.5, index + 0.95, 64, 1]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh>
              <ringGeometry args={[index + 0.95, index + 1, 64, 1]} />
              <meshStandardMaterial color={"black"} />
            </mesh>
          </mesh>
        );
      })}
      <mesh position={[0, -0.25, -0.6]}>
        <boxGeometry args={[1.5, 2, 0.5]} />
        <meshStandardMaterial color={"#011635"} />
      </mesh>
    </mesh>
  );
}

type ArrowProps = {
  position: any;
  rotation: any;
};
export function Arrow({ position, rotation }: ArrowProps) {
  const length = 0.75;
  const diameter = 0.0065;

  const fletching = new Shape();
  fletching.moveTo(0, 0);
  fletching.lineTo(0, 0.1);
  fletching.lineTo(0.015, 0.05);
  fletching.lineTo(0.015, 0.02);
  fletching.lineTo(0, 0);

  return (
    <mesh position={position} rotation={rotation}>
      {/* shaft */}
      <mesh position={[0, 0, -length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[diameter, diameter, length, 32]} />
        <meshStandardMaterial color={"sienna"} metalness={0.5} />
      </mesh>
      {/* tip neck */}
      <mesh
        position={[0, 0, -length + diameter]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[diameter * 1.1, diameter * 1.1, diameter * 3, 32]}
        />
        <meshStandardMaterial color={"gray"} metalness={0.5} />
      </mesh>
      {/* tip */}
      {[1.1, 0.9, 0.7, 0.4, 0].map((width, index, array) => {
        const prev = index == 0 ? 0 : array[index - 1];
        const position: any = [0, 0, -length - index * diameter];
        const rotation: any = [-Math.PI / 2, 0, 0];
        return (
          <mesh
            position={position}
            rotation={rotation}
            key={index}
            scale={diameter}
          >
            <cylinderGeometry args={[width, prev, 1, 16, 1, true]} />
            <meshStandardMaterial color={"gray"} metalness={0.5} />
          </mesh>
        );
      })}
      {/* fletchings */}
      {[1, 3, 5].map((rotation, index) => (
        <mesh
          position={[0, 0, -0.01]}
          rotation={[-Math.PI / 2, (rotation * Math.PI) / 3, 0]}
          key={index}
        >
          <extrudeGeometry
            args={[
              fletching,
              {
                steps: 1,
                bevelSegments: 1,
                depth: 0.001,
                bevelSize: 0.005,
                bevelThickness: 0.002,
              },
            ]}
          />
          <meshStandardMaterial color={"green"} metalness={0.5} />
        </mesh>
      ))}
    </mesh>
  );
}

type FloorProps = {
  floorLevel: number;
};
export function Floor({ floorLevel }: FloorProps) {
  return (
    <mesh>
      {[-5, -3, -1, 1, 3, 5].map((position, index) => {
        return (
          <mesh key={index}>
            <mesh
              position={[position, floorLevel, -10]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[1, 20, 1, 1]} />
              <meshStandardMaterial color={"white"} />
            </mesh>
            <mesh
              position={[0, -2, position]}
              rotation={[0, 0, Math.PI / 2]}
            ></mesh>
          </mesh>
        );
      })}
    </mesh>
  );
}
