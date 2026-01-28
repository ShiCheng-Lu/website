"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Euler, Shape, TextureLoader, Vector2, Vector3 } from "three";
import useCountriesInConflict from "./countriesInConflict";
import { Canvas, useLoader } from "@react-three/fiber";
import Camera from "@/util/three-camera";
import { clamp } from "@/util/util";
import { MeshGeometry } from "@/components/MeshGeometry";
import { icosphere } from "@/util/geometry/icosahedron";
import {
  Polygon,
  coordinateToVector,
  vectorToCoordinate,
} from "@/util/geometry";
import { intersection } from "@/util/geometry/intersection";
import useCountryGeometry from "./countryGeometry";

export function Globe({ flat }: { flat: boolean }) {
  const texture = useLoader(TextureLoader, "textures/2k_earth_daymap.jpg");
  return flat ? (
    <mesh>
      <planeGeometry args={[360, 180]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  ) : (
    <mesh rotation={[0, -Math.PI / 2, 0]}>
      <sphereGeometry args={[60, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function PoliticalAndEconomicStateOfTheWorldRightNow() {
  const { conflicts10000, conflicts1000, conflicts100 } =
    useCountriesInConflict();
  const filter = useMemo(() => [...conflicts10000, ...conflicts1000, ...conflicts100],
    [conflicts10000, conflicts1000, conflicts100]);
  const geometry = useCountryGeometry(filter);

  const CAMERA_HEIGHT = 100;

  const [paths, setPaths] = useState<Shape[]>([]);
  const [paths2, setPaths2] = useState<Vector3[][]>([]);
  const [position, setPosition] = useState(new Vector3(0, 0, CAMERA_HEIGHT));
  const [rotation, setRotation] = useState(new Euler(0, 0, 0, "YXZ"));
  const camera = useRef({
    position: new Vector3(0, 0, CAMERA_HEIGHT),
    rotation: new Euler(0, 0, 0),
  });
  const globe = useRef(true);
  const [globeState, setGlobeState] = useState(true);

  const ico = useMemo(() => {
    const ico = icosphere(4);
    return ico;
  }, []);

  useEffect(() => {
    console.log(`filter is changing ${JSON.stringify(filter)}`);
  }, [filter]);

  useEffect(() => {
    console.log(`conflicts10000 is changing ${JSON.stringify(conflicts10000)}`);
  }, [conflicts10000]);

  useEffect(() => {
    console.log(`conflicts1000 is changing ${JSON.stringify(conflicts1000)}`);
  }, [conflicts1000]);

  useEffect(() => {
    console.log(`conflicts100 is changing ${JSON.stringify(conflicts100)}`);
  }, [conflicts100]);

  useEffect(() => {
    console.log(`geometry is changing ${JSON.stringify(geometry)}`);
  }, [geometry]);

  useEffect(() => {
    if (!geometry) return;
    console.log(geometry);

    const shapeFor = (polygon: Polygon) => {
      const path = new Shape();
      if (polygon.length > 0) {
        path.moveTo(polygon[0].x, polygon[0].y);
      }
      for (let i = 1; i < polygon.length; ++i) {
        path.lineTo(polygon[i].x, polygon[i].y);
      }
      return path;
    };

    const paths = [];
    const paths2 = [];

    const icoTriangles = [];
    for (const indices of ico.indices) {
      const a = vectorToCoordinate(ico.vertices[indices.x]);
      const b = vectorToCoordinate(ico.vertices[indices.y]);
      const c = vectorToCoordinate(ico.vertices[indices.z]);
      icoTriangles.push([
        new Vector2(a.longitude, a.latitude),
        new Vector2(b.longitude, b.latitude),
        new Vector2(c.longitude, c.latitude),
        new Vector2(a.longitude, a.latitude),
      ]);
    }

    for (const country of geometry) {
      console.log(country.names["en"]);

      for (const p of country.geometry) {
        paths.push(shapeFor(p));
        // russia causes problems, but ok for shape
        if (country.names["en"] === "Russia") {
          continue;
        }

        for (const t of icoTriangles) {
          paths2.push(
            ...intersection(t, p).map((x) => {
              x.pop();
              x.reverse();
              return x.map((c) =>
                coordinateToVector(c.y, c.x).multiplyScalar(60.1)
              );
            })
          );
        }
      }
    }
    // only do triangles for now
    // console.log(paths);
    setPaths2(paths2.filter((p) => p.length === 3));
    setPaths(paths);
    console.log("path set");
  }, [geometry]);

  useEffect(() => {
    let down = false;
    const mousedown = () => {
      down = true;
    };
    const mouseup = () => {
      down = false;
    };
    const mousemove = (event: MouseEvent) => {
      if (down && globe.current) {
        const newRotation = new Euler(
          clamp(
            camera.current.rotation.x - event.movementY * 0.002,
            -Math.PI / 2,
            Math.PI / 2
          ),
          camera.current.rotation.y - event.movementX * 0.002,
          0,
          "YXZ"
        );
        camera.current.rotation = newRotation;
        setRotation(newRotation);
        setPosition(camera.current.position.clone().applyEuler(newRotation));
      }
    };

    window.addEventListener("mousedown", mousedown);
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mousemove", mousemove);

    return () => {
      window.removeEventListener("dragstart", mousedown);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mousemove", mousemove);
    };
  }, []);

  const toggleGlobe = () => {
    globe.current = !globe.current;
    camera.current = {
      position: new Vector3(0, 0, CAMERA_HEIGHT),
      rotation: new Euler(0, 0, 0),
    };
    setRotation(camera.current.rotation.clone());
    setPosition(camera.current.position.clone());
    setGlobeState(globe.current);
  };

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
      <Canvas style={{ flex: 1, touchAction: "none", background: "black" }}>
        <Camera fov={90} position={position} rotation={rotation} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={1} />

        <Suspense>
          <Globe flat={!globeState} />
          {globeState ? (
            <mesh>
              <MeshGeometry faces={paths2} />
              <meshStandardMaterial color={"red"} opacity={0.5} transparent />
            </mesh>
          ) : (
            <mesh position={[0, 0, 0.1]}>
              <shapeGeometry args={[paths]} />
              <meshStandardMaterial color={"red"} opacity={0.5} transparent />
            </mesh>
          )}
        </Suspense>
      </Canvas>
      <div style={{ position: "fixed", right: 10, bottom: 10 }}>
        <button
          onClick={toggleGlobe}
          style={{ width: 75, height: 75, borderRadius: 30 }}
        >
          {globeState ? "Flat" : "Globe"}
        </button>
      </div>
    </div>
  );
}
