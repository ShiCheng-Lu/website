import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";

// rotation of the message
//   0 = top heavy triangle
//   1 = bot heavy triangle
// and use extra space as padding
const faces = [
  { rotation: 0, message: ["WITHOUT", "A", "DOUBT"] },
  { rotation: 1, message: ["IT IS", "CERTAIN"] },
  { rotation: 0, message: ["IT IS", "DECIDEDLY", "SO"] },
  { rotation: 1, message: ["YES", "DEFINITELY"] },
  { rotation: 0, message: ["YOU MAY", "RELY", "ON IT"] },
  { rotation: 1, message: ["MOST", "LIKELY"] },
  { rotation: 0, message: ["OUTLOOK", "GOOD"] },
  { rotation: 0, message: ["AS I", "SEE IT", "YES"] },
  { rotation: 1, message: ["YES"] },
  { rotation: 0, message: ["SIGNS", "POINT TO", "YES"] },
  { rotation: 1, message: ["VERY", "DOUBTFUL"] },
  { rotation: 0, message: ["MY REPLY", "IS", "NO"] },
  { rotation: 1, message: ["DON'T", "COUNT", "ON IT"] },
  { rotation: 0, message: ["OUTLOOK", "NOT SO", "GOOD"] },
  { rotation: 0, message: ["BETTER NOT", "TELL YOU", "NOW"] },
  { rotation: 0, message: ["", "MY", "SOURCES", "SAY", "NO"] },
  { rotation: 1, message: ["ASK", "AGAIN", "LATER"] },
  { rotation: 0, message: ["REPLY HAZY", "TRY", "AGAIN"] },
  { rotation: 0, message: ["CONCENTRATE", "AND ASK", "AGAIN"] },
  { rotation: 1, message: ["CANNOT", "PREDICT", "NOW"] },
];

export default function Magic8Ball() {
  const [face, setFace] = useState(0);

  useEffect(() => {
    setFace(Math.floor(Math.random() * 20));
  }, []);

  const shape = new THREE.Shape();
  const scale = 0.6;
  shape.moveTo(0, 1 * scale);
  shape.lineTo((Math.sqrt(3) / 2) * scale, (-1 / 2) * scale);
  shape.lineTo((-Math.sqrt(3) / 2) * scale, (-1 / 2) * scale);
  shape.lineTo(0, 1 * scale);

  const baseRotation = new THREE.Quaternion().setFromAxisAngle(
    { x: 1, y: 0, z: 0 },
    Math.acos(-Math.sqrt(5) / 3) / 2
  );
  const additionalRotation = new THREE.Quaternion().setFromAxisAngle(
    { x: 0, y: 0, z: 1 },
    0.0 + Math.PI * faces[face].rotation
  );
  const finalRotation = new THREE.Euler().setFromQuaternion(
    additionalRotation.multiply(baseRotation)
  );

  return (
    <div
      style={{
        position: "absolute",
        width: "30%",
        height: "30%",
        top: 300,
        left: 30,
      }}
    >
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={10} />

        <rectAreaLight />
        {/* top right and from behind view */}
        <mesh>
          <torusGeometry args={[1, 2, 64, 32]} />
          <meshStandardMaterial color="black" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 2]}>
          <ringGeometry args={[0, 1, 32, 32]} />
          <meshStandardMaterial
            color="black"
            roughness={0.5}
            metalness={1}
            emissive={0x292222}
          />
        </mesh>
        <mesh position={[0, 0, 1.25]} rotation={finalRotation}>
          {/* <extrudeGeometry
            args={[shape, { bevelSegments: 1, depth: 0, bevelSize: 0.1 }]}
          ></extrudeGeometry> */}
          <icosahedronGeometry />
          <meshStandardMaterial
            color="darkblue"
            roughness={0.5}
            metalness={0.3}
            emissive={0x292222}
          />
        </mesh>
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(0)",
          zIndex: 1,
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {faces[face].message.map((str) => (
          <p style={{ fontSize: 8 }}>{str}</p>
        ))}
      </div>
    </div>
  );
}
