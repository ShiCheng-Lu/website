export type TargetProps = {
  distance: number;
};

export function Target({ distance }: TargetProps) {
  return (
    <mesh
      position={[0, 0, -distance]}
      rotation={[-((10 / 180) * Math.PI), 0, 0]}
      scale={0.4 / 5}
    >
      {["yellow", "red", "blue", "black", "white"].map((color, index) => {
        const ringColor = color == "black" ? "white" : "black";
        return (
          <mesh key={index}>
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

  return (
    <mesh position={position} rotation={rotation}>
      <mesh position={[0, 0, -length / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[diameter, diameter, length, 32]} />
        <meshStandardMaterial color={"sienna"} metalness={0.5} />
      </mesh>
      <mesh
        position={[0, 0, -length + diameter]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[diameter * 1.1, diameter * 1.1, diameter * 3, 32]}
        />
        <meshStandardMaterial color={"gray"} metalness={0.5} />
      </mesh>
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
    </mesh>
  );
}
