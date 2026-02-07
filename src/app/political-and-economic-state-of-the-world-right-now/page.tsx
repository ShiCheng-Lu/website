"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Euler, Shape, TextureLoader, Vector2, Vector3 } from "three";
import useCountriesInConflict from "./countriesInConflict";
import { Canvas, useLoader } from "@react-three/fiber";
import Camera from "@/util/three-camera";
import { clamp } from "@/util/util";
import { MeshGeometry } from "@/components/MeshGeometry";
import { icosphere } from "@/util/geometry/icosahedron";
import {
  Polygon,
  coordinateDistance,
  coordinateToVector,
  lerp,
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

function Line({ line, color }: { line: Vector3[]; color: string }) {
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

export default function PoliticalAndEconomicStateOfTheWorldRightNow() {
  const { conflicts10000, conflicts1000, conflicts100 } =
    useCountriesInConflict();
  const filter = [...conflicts10000, ...conflicts1000, ...conflicts100];
  const geometry = useCountryGeometry(filter);

  const CAMERA_HEIGHT = 100;

  const [paths, setPaths] = useState<Polygon[]>([]);
  const [borders, setBorders] = useState<Polygon[]>([]);
  const [position, setPosition] = useState(new Vector3(0, 0, CAMERA_HEIGHT));
  const [rotation, setRotation] = useState(new Euler(0, 0, 0, "YXZ"));
  const camera = useRef({
    position: new Vector3(0, 0, CAMERA_HEIGHT),
    rotation: new Euler(0, 0, 0),
  });
  const [globe, setGlobeState] = useState(true);

  const ico = icosphere(4);
  useEffect(() => {
    if (!geometry) return;

    const paths: Polygon[] = [];

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

    const start = Date.now();
    const icos = [];

    const borders = [];
    const fineThreshold = 0.05;
    for (const country of geometry) {
      for (const geometry of country.geometry) {
        const border = geometry.slice(0, -1).flatMap((point, j) => {
          const next = geometry[j + 1];
          const distance = coordinateDistance(point, next);
          if (distance > fineThreshold) {
            const segments = Math.floor(distance / fineThreshold);
            return Array(segments)
              .fill(0)
              .map((_, j) => lerp(point, next, j / segments));
          } else {
            return [point];
          }
        });
        // add last point since it's not processed
        border.push(geometry[geometry.length - 1]);
        borders.push(border);
      }
    }

    const polygons = [];
    for (const country of geometry) {
      for (const polygon of country.geometry) {
        let normal = polygon[polygon.length - 1].cross(polygon[0]);
        for (let i = 0; i < polygon.length - 1; ++i) {
          normal += polygon[i].cross(polygon[i + 1]);
        }
        if (normal > 0) {
          polygons.push(polygon);
        } else {
          console.log(
            `${country.names["en"]} has a polygon that's facing the wrong way`
          );
        }
      }
    }

    // for (const t of icoTriangles) {
    for (let ti = 0; ti < icoTriangles.length; ++ti) {
      const t = icoTriangles[ti];
      // if (ti !== 904) {
      // paths.push(t.reverse());
      // continue;
      // }
      // continue;
      let n = t[t.length - 1].cross(t[0]);
      for (let i = 0; i < t.length - 1; ++i) {
        n += t[i].cross(t[i + 1]);
      }
      let minx = t.reduce((acc, p) => Math.min(acc, p.x), Infinity);
      let maxx = t.reduce((acc, p) => Math.max(acc, p.x), -Infinity);

      if (
        n > 0 ||
        (minx < 0 && maxx > 0 && maxx > 50 && minx < -50) ||
        minx > 169 ||
        maxx < -169
      ) {
        // this triangle is at the edge -180 to 180, so the boundaries are kinda fucked when trying to do intersection with the country boarders
      } else {
        t.reverse();
        icos.push(t);

        // console.log(country.names["en"]);
        for (const p of polygons) {
          // if the polygon is backwards, log and skip
          const polygon = intersection(t, p);
          // if (polygon.length) {
          //   console.log(t);
          //   console.log(p);
          // }
          // const tris = polygon.flatMap(triangulation);
          paths.push(...polygon);
        }
      }
    }
    // console.log(paths);
    const end = Date.now();
    console.log(`Time to process ${geometry.length} countries ${end - start}`);

    // only do triangles for now
    setPaths(paths);
    setBorders(borders);
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
      if (down) {
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

    window.addEventListener("pointerdown", mousedown);
    window.addEventListener("pointerup", mouseup);
    window.addEventListener("pointermove", mousemove);

    return () => {
      window.removeEventListener("pointerdown", mousedown);
      window.removeEventListener("pointerup", mouseup);
      window.removeEventListener("pointermove", mousemove);
    };
  }, []);

  const toggleGlobe = () => {
    setGlobeState(!globe);
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
        <Camera
          fov={90}
          // position={[0, 0, 30]}
          position={globe ? position : new Vector3(0, 0, CAMERA_HEIGHT)} //
          rotation={globe ? rotation : new Euler()}
        />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={1} />

        <Suspense>
          <Globe flat={!globe} />
          {globe ? (
            <mesh>
              <mesh>
                <MeshGeometry
                  faces={paths.map((p) =>
                    p.map((c) =>
                      coordinateToVector(c.y, c.x).multiplyScalar(60.1)
                    )
                  )}
                />
                <meshStandardMaterial
                  color={"red"}
                  opacity={0.3}
                  transparent
                  // wireframe
                />
              </mesh>
              {borders.map((border, index) => (
                <Line
                  key={index}
                  line={border.map((p) =>
                    coordinateToVector(p.y, p.x).multiplyScalar(60.1)
                  )}
                  color="orange"
                />
              ))}
            </mesh>
          ) : (
            <mesh>
              <mesh position={[0, 0, 0.1]}>
                <shapeGeometry args={[paths.map((p) => new Shape(p))]} />
                <meshStandardMaterial
                  color={"red"}
                  opacity={0.5}
                  transparent
                  wireframe
                />
              </mesh>
              {borders.map((border, index) => (
                <Line
                  key={index}
                  line={border.map((p) => new Vector3(p.x, p.y, 0.2))}
                  color="orange"
                />
              ))}
            </mesh>
          )}
        </Suspense>
      </Canvas>
      <div style={{ position: "fixed", width: "100%", bottom: 0 }}>
        <div style={{ position: "absolute", bottom: 10 }}></div>
        <div style={{ position: "absolute", right: 10, bottom: 10 }}>
          <button
            onClick={toggleGlobe}
            style={{ width: 75, height: 75, borderRadius: 30 }}
          >
            {globe ? "Flat" : "Globe"}
          </button>
        </div>
      </div>
    </div>
  );
}
