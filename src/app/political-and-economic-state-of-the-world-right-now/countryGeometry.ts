import { useEffect, useState } from "react";
import { Vector2 } from "three";

type CountryGeometry = {
  names: { [key: string]: string };
  geometry: Vector2[][]; // a list of polygons
};

export default function useCountryGeometry(filter: string[]) {
  const [geometry, setGeometry] = useState<CountryGeometry[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      console.log("start reading");
      const response = await fetch("/country-borders.geojson");
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
