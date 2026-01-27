"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Euler,
  IcosahedronGeometry,
  Shape,
  ShapePath,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import useCountriesInConflict from "./countriesInConflict";
import { Canvas, useLoader } from "@react-three/fiber";
import Camera from "@/util/three-camera";
import { clamp } from "@/util/util";
import { MeshGeometry } from "@/components/MeshGeometry";
import { icosphere } from "@/util/geometry/icosahedron";
import { MeshGeometry2 } from "@/util/geometry";

type CountryGeometry = {
  names: { [key: string]: string };
  geometry: Vector2[][]; // a list of polygons
};

function useCountryGeometry(filter: string[]) {
  const [geometry, setGeometry] = useState<CountryGeometry[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      console.log("start reading");
      const response = await fetch("country-borders.geojson");
      const json = await response.json();
      setCountries(json.features);
      console.log("finish reading");
    })();
  }, []);

  useEffect(() => {
    if (!filter) {
      console.log("no filter");
      return;
    }
    if (!countries) {
      console.log("no countries");
      return;
    }
    console.log("ok continue");
    // parsing geojson objects into a list of polygons
    const parseGeometryCollection = (json: any): Vector2[][] => {
      if (json.type !== "GeometryCollection") {
        console.log("Expected geojson type to be 'GeometryCollection'");
        return [];
      }
      return json.geometries.flatMap((feature: any) => parseGeoJson(feature));
    };
    const parsePolygon = (json: any): Vector2[][] => {
      if (json.type !== "Polygon") {
        console.log("Expected geojson type to be 'Polygon'");
        return [];
      }
      return json.coordinates.map((polygon: [number, number][]) =>
        polygon.map(([lat, long]) => new Vector2(lat, long))
      );
    };
    const parseMultiPolygon = (json: any): Vector2[][] => {
      if (json.type !== "MultiPolygon") {
        console.log("Expected geojson type to be 'MultiPolygon'");
        return [];
      }
      return json.coordinates.map((polygon: [number, number][][]) =>
        polygon[0].map(([lat, long]) => new Vector2(lat, long))
      );
    };
    const parseGeoJson = (json: any) => {
      switch (json.type) {
        case "Polygon":
          return parsePolygon(json);
        case "MultiPolygon":
          return parseMultiPolygon(json);
        default:
          return [];
      }
    };

    const geometry = countries
      .filter((country: any) => {
        const names = country.properties.names as { [key: string]: string };
        return Object.values(names).some((name: string) =>
          filter.includes(name)
        );
      })
      .map((country: any) => {
        const names = country.properties.names as { [key: string]: string };
        const shape = parseGeometryCollection(country.geometry);

        return {
          names,
          geometry: shape,
        };
      });
    setGeometry(geometry);
  }, [countries, filter]);

  return geometry;
}

export function Globe() {
  const texture = useLoader(TextureLoader, "textures/2k_earth_daymap.jpg");
  return (
    <mesh>
      <sphereGeometry args={[60, 64, 64]} />
      {/* <planeGeometry args={[360, 180]} /> */}
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function PoliticalAndEconomicStateOfTheWorldRightNow() {
  const { conflicts10000, conflicts1000, conflicts100 } =
    useCountriesInConflict();
  const geometry = useCountryGeometry([
    ...conflicts10000,
    // ...conflicts1000,
    // ...conflicts100,
  ]);

  const [paths, setPaths] = useState<Shape[]>([]);
  const [paths2, setPaths2] = useState<Vector3[][]>([]);
  const [position, setPosition] = useState(new Vector3(0, 0, 120));
  const [rotation, setRotation] = useState(new Euler(0, 0, 0, "YXZ"));
  const camera = useRef({
    position: new Vector3(0, 0, 120),
    rotation: new Euler(0, 0, 0),
  });

  const ico = useMemo(() => {
    const ico = icosphere(4);
    console.log(`Iso has ${ico.vertices.length} vertices`);
    console.log(`Iso has ${ico.indices.length} faces`);
    return ico;
  }, []);

  useEffect(() => {
    if (!geometry) return;
    console.log(geometry);

    const paths = [];
    const paths2 = [];
    for (const country of geometry) {
      for (const polygon of country.geometry) {
        const path = new Shape();
        if (polygon.length > 0) {
          path.moveTo(polygon[0].x, polygon[0].y);
        }
        for (let i = 1; i < polygon.length; ++i) {
          path.lineTo(polygon[i].x, polygon[i].y);
        }
        paths.push(path);

        // if (paths2.length === 0) {
        // paths2.push(
        //   polygon.map((v) => new Vector3(v.x, v.y, 10)).slice(0, -1)
        // );
        // }
      }
    }
    setPaths(paths);
    // setPaths2(paths2);
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

    window.addEventListener("mousedown", mousedown);
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mousemove", mousemove);

    return () => {
      window.removeEventListener("dragstart", mousedown);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mousemove", mousemove);
    };
  }, []);

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
          <Globe />
          {/* <mesh>
            <shapeGeometry args={[paths]} />
            <meshStandardMaterial color={"red"} />
          </mesh>
          <mesh>
            <MeshGeometry faces={paths2} />
            <meshStandardMaterial color={"blue"} />
          </mesh> */}
        </Suspense>

        <mesh>
          <MeshGeometry2
            vertices={ico.vertices.map((v) => v.multiplyScalar(60.1))}
            normals={ico.normals}
            indices={ico.indices}
          />
          <meshStandardMaterial color={"green"} wireframe/>
        </mesh>
        {/* <mesh>
          <icosahedronGeometry args={[60.2, 15]}/>
          <meshStandardMaterial color={"red"} wireframe/>
        </mesh> */}
      </Canvas>
    </div>
  );
}
