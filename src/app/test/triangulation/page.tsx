"use client";

import useCountryGeometry from "@/app/political-and-economic-state-of-the-world-right-now/countryGeometry";
import { MeshGeometry } from "@/components/MeshGeometry";
import {
  monotoneDecomposition,
  monotoneTriangulation,
  toCompletePolygon,
  triangulation,
} from "@/util/geometry/triangulation";
import Camera from "@/util/three-camera";
import { Canvas } from "@react-three/fiber";
import { FrontSide, GridHelper, Shape, Vector2, Vector3 } from "three";

export default function TriangulationTest() {
  const country = useCountryGeometry(["Russia"]);

  const CAMERA = new Vector3(30, 59, 100);

  const polygon = country.length
    ? country[0].geometry
    : [
        [
          new Vector2(-10, -10),
          new Vector2(10, -10),
          new Vector2(5, -15),
          new Vector2(25, -20),
          // new Vector2(20, -10),
          new Vector2(22, -5),
          new Vector2(-10, 10),
          // new Vector2(-10, -10),
        ],
      ];

  // const shapes = polygon.map((g) => new Shape(g));
  const i = 7;
  // console.log(polygon.length);
  const polygons = polygon
    .slice(i, i + 1)
    .flatMap((g) => monotoneDecomposition(g));
  // const triangles = polygon.flatMap((g) => triangulation(g));
  // const shapes = triangles.map((g) => new Shape(g));
  // const shapes = polygons.map((g) => new Shape(toCompletePolygon(g)));
  const shapes = polygon.slice(i, i + 1).map((g) => new Shape(g));

  const colors = [
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "cyan",
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        userSelect: "none",
      }}
      onScroll={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Canvas style={{ flex: 1, touchAction: "none" }}>
        <Camera fov={90} position={CAMERA} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={1} />

        <mesh>
          <gridHelper
            args={[360, 36, "red", "black"]}
            position={[CAMERA.x, CAMERA.y, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          <meshStandardMaterial color={"black"} opacity={0.5} transparent />
        </mesh>

        {polygons.map((polygon, i) => (
          <mesh key={i}>
            <shapeGeometry args={[new Shape(toCompletePolygon(polygon))]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              opacity={0.5}
              transparent
              side={FrontSide}
            />
          </mesh>
        ))}

        <mesh position={[0, 0, 0]}>
          <shapeGeometry args={[shapes]} />
          <meshStandardMaterial color={"red"} wireframe side={FrontSide} />
        </mesh>
      </Canvas>
    </div>
  );
}
