import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { DragHandler } from "./DraggableWindow";

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

class ShakeDragHandler extends DragHandler {
  onShake: () => void;
  movements: number[] = Array(5).fill(0);
  shaken = false;
  movement: number = 0;
  timeout: any;

  constructor(
    startX: number,
    startY: number,
    setLocation: (location: any) => void,
    onShake: () => void
  ) {
    super(startX, startY, setLocation);
    this.onShake = onShake;
  }

  update(e: PointerEvent) {
    if (!e) return;

    super.update(e);
    this.movement += Math.abs(e.movementX) + Math.abs(e.movementY);
  }

  updateShakeStatus() {
    this.movements.push(this.movement);
    this.movements.shift();

    this.movement = 0;
    // check if we shaked the ball, and wait for shakes to finish
    const movementSum = this.movements.reduce((a, b) => a + b, 0);
    if (movementSum > 1000) {
      this.shaken = true;
    } else if (this.movement < 5 && this.shaken) {
      this.onShake();
      this.shaken = false;
    }
  }

  start() {
    super.start();
    this.timeout = setInterval(this.updateShakeStatus.bind(this), 100);
  }

  stop() {
    super.stop();
    if (this.shaken) {
      this.onShake();
    }
    if (this.timeout) {
      clearInterval(this.timeout);
    }
    this.timeout = undefined;
  }
}

export default function Magic8Ball() {
  const initialPosition = { x: 30, y: 300 };
  const [face, setFace] = useState(0);

  const randomize = () => {
    setFace(Math.floor(Math.random() * 20));
  };
  useEffect(randomize, []);

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

  const [location, setLocation] = useState(initialPosition);
  const [updateFunction, setUpdateFunction] = useState<ShakeDragHandler>();
  const startDrag = (e: PointerEvent) => {
    if (typeof window === "undefined") return;

    if (updateFunction) {
      updateFunction.stop();
    }
    // this must be an object reference, otherwise something something to do with states and it doesn't update the state of updateFunction, and we get a null reference on mouse release
    const dragHandler = new ShakeDragHandler(
      e.clientX - location.x,
      e.clientY - location.y,
      (l) => setLocation(l),
      () => setFace(Math.floor(Math.random() * 20))
    );
    dragHandler.start();
    setUpdateFunction(dragHandler);
  };

  return (
    <div
      style={{
        position: "absolute",
        width: 300,
        height: 300,
        top: location.y,
        left: location.x,
        overflow: "hidden",
      }}
    >
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={10} />

        <rectAreaLight />
        {/* top right and from behind view */}
        <mesh onPointerDown={startDrag}>
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
        onTouchEnd={() => {
          // touch will generate a new face since it's hard to shake on mobile
          randomize();
        }}
      >
        {faces[face].message.map((str, index) => (
          <p key={index} style={{ fontSize: 8 }}>
            {str}
          </p>
        ))}
      </div>
    </div>
  );
}
