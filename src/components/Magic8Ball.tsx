import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { DragHandler } from "./DraggableWindow";
import styles from "./Magic8Ball.module.css";

// rotation of the message
//   0 = top heavy triangle
//   1 = bot heavy triangle
// and use extra space as padding
const faces = [
  { rotation: 0, message: [] }, // none face as empty state
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
  onEndShake: () => void;
  movements: number[] = Array(3).fill(0);
  shaken = false;
  movement: number = 0;
  timeout?: NodeJS.Timeout;

  constructor(
    startX: number,
    startY: number,
    setLocation: (location: any) => void,
    onShake: () => void,
    onEndShake: () => void
  ) {
    super(startX, startY, setLocation);
    this.onShake = onShake;
    this.onEndShake = onEndShake;
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
    if (movementSum > 300) {
      this.shaken = true;
      this.onShake();
    } else if (this.movement < 5 && this.shaken) {
      this.onEndShake();
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
      this.onEndShake();
    }
    clearInterval(this.timeout);
    this.timeout = undefined;
  }
}

class ShakeMotionhandler {
  onShake: () => void;
  onEndShake: () => void;
  shakeHistory = Array(5).fill(0);
  shaken = false;
  timeout?: NodeJS.Timeout;

  constructor(onShake: () => void, onEndShake: () => void) {
    this.onShake = onShake;
    this.onEndShake = onEndShake;
  }
  countShake() {
    if (this.shakeHistory.every((x) => x > 0)) {
      this.onShake();
      this.shaken = true;
    } else if (this.shaken) {
      this.onEndShake();
      this.shaken = false;
    }
    this.shakeHistory.unshift(0);
    this.shakeHistory.pop();
  }

  devicemotion(e: DeviceMotionEvent) {
    if (e.acceleration) {
      const x = e.acceleration.x || 0;
      const y = e.acceleration.y || 0;
      const z = e.acceleration.z || 0;
      if (Math.sqrt(x * x + y * y + z * z) > 10) {
        this.shakeHistory[0] += 1;
      }
    }
  }

  start() {
    if (this.timeout) {
      // already initialized
      return;
    }
    window.addEventListener("devicemotion", this.devicemotion.bind(this));
    this.timeout = setInterval(this.countShake.bind(this), 100);
  }
}

export default function Magic8Ball({
  fixedPosition,
}: {
  fixedPosition?: boolean;
}) {
  const initialPosition = { x: 30, y: 300 };
  const [face, setFace] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pointerOver, setPointerOver] = useState(false);

  const randomize = () => {
    setFace(Math.floor(Math.random() * 20 + 1));
    setRotation((Math.random() - 0.5) * 45);

    const radius = Math.random() * 20;
    const angle = Math.random() * 2 * Math.PI;
    setOffset({
      x: Math.sin(angle) * radius,
      y: Math.cos(angle) * radius,
    });
  };
  const motionHandler = new ShakeMotionhandler(() => setFace(0), randomize);
  useEffect(() => {
    // set up accelerometer for mobile
    if (window.DeviceMotionEvent != undefined) {
      motionHandler.start();
    }
    randomize();
  }, []);

  const baseRotation = new THREE.Quaternion().setFromAxisAngle(
    { x: 1, y: 0, z: 0 },
    Math.acos(-Math.sqrt(5) / 3) / 2
  );
  const additionalRotation = new THREE.Quaternion().setFromAxisAngle(
    { x: 0, y: 0, z: 1 },
    0.0 + Math.PI * faces[face].rotation - (rotation / 180) * Math.PI
  );
  const finalRotation = new THREE.Euler().setFromQuaternion(
    additionalRotation.multiply(baseRotation)
  );

  const [location, setLocation] = useState(initialPosition);
  const [updateFunction, setUpdateFunction] = useState<ShakeDragHandler>();
  const startDrag = (e: { clientX: number; clientY: number }) => {
    if (fixedPosition) {
      setFace(0);
      setTimeout(randomize, 10);
      return;
    }

    if (typeof window === "undefined") return;

    if (updateFunction) {
      updateFunction.stop();
    }
    const dragHandler = new ShakeDragHandler(
      e.clientX - location.x,
      e.clientY - location.y,
      (l) => setLocation(l),
      () => setFace(0),
      () => randomize()
    );
    dragHandler.start();
    setUpdateFunction(dragHandler);
  };

  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2);

  return (
    <div
      className={pointerOver && !fixedPosition ? styles.Magic8BallGrab : ""}
      style={
        fixedPosition
          ? {
              position: "relative",
              width: 300,
              height: 300,
              userSelect: "none",
            }
          : {
              position: "absolute",
              width: 300,
              height: 300,
              top: location.y,
              left: location.x,
              userSelect: "none",
            }
      }
      onPointerMove={(e) => {
        const bound = e.currentTarget!.getBoundingClientRect();
        const dy = e.clientY - (bound.top + bound.bottom) / 2;
        const dx = e.clientX - (bound.left + bound.right) / 2;
        const r =
          (bound.bottom - bound.top + bound.right - bound.left - 70) / 4;
        const inside = dx * dx + dy * dy < r * r;
        setPointerOver(inside);
        return inside;
      }}
    >
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={10} />

        <rectAreaLight />
        {/* top right and from behind view */}
        <mesh
          onPointerDown={startDrag}
          onClick={() => (DeviceMotionEvent as any).requestPermission?.()}
        >
          <torusGeometry args={[1, 2, 32, 64]} />
          <meshStandardMaterial color="black" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 2]}>
          <ringGeometry args={[0, 1, 64, 1]} />
          <meshStandardMaterial
            color="black"
            roughness={0.5}
            metalness={1}
            emissive={0x292222}
          />
        </mesh>
      </Canvas>
      {face ? (
        <div
          className={styles.fortune}
          style={{
            top: `calc(50% + ${offset.y}px)`,
            left: `calc(50% + ${offset.x}px)`,
          }}
        >
          <Canvas
            gl={{ localClippingEnabled: true }}
            style={{ pointerEvents: "none" }}
          >
            <ambientLight intensity={1} />
            <directionalLight
              position={[5, 5, 5]}
              color="white"
              intensity={10}
            />

            <rectAreaLight />
            <mesh position={[0, 0, 1.25]} rotation={finalRotation}>
              <icosahedronGeometry />
              <meshStandardMaterial
                color="darkblue"
                roughness={0.5}
                metalness={0.3}
                emissive={0x292222}
                clippingPlanes={[clippingPlane]}
              />
            </mesh>
          </Canvas>
          <div
            className={styles.fortuneText}
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            {faces[face].message.map((str, index) => (
              <p key={index}>{str}</p>
            ))}
          </div>
        </div>
      ) : undefined}
    </div>
  );
}
