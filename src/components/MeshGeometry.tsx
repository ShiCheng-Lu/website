"use client";

import { useMemo } from "react";
import { Vector2, Vector3 } from "three";

type MeshGeometryProps = {
  faces: Vector3[][];
};

function triangulation(
  points: Vector2[],
  polygon: number[],
  sortedIndex: number[],
  start: number = 1
): number[] {
  // Part 1.
  // Monotone decomposition, split polygon into polygons that are monotone in x
  for (let i = start; i < sortedIndex.length - 1; ++i) {
    const index = sortedIndex[i];
    const prev =
      points[
        polygon[(index - 2 + sortedIndex.length) % (sortedIndex.length - 1)]
      ];
    const next = points[polygon[(index + 1) % (sortedIndex.length - 1)]];
    const curr = points[polygon[index]];

    // console.log(
    //   (index - 2 + sortedIndex.length) % (sortedIndex.length - 1),
    //   (index + 1) % (sortedIndex.length - 1),
    //   index
    // );

    // if point is a merge, connect it with the next point
    let connect = undefined;
    const convex =
      (prev.y - curr.y) * (next.x - curr.x) <=
      (next.y - curr.y) * (prev.x - curr.x);
    if (prev.x <= curr.x && next.x < curr.x && convex) {
      // connect (i) and (i + 1);
      connect = sortedIndex[i + 1];
      console.log(
        `merge ${i} (${prev.x} ${prev.y}) (${curr.x} ${curr.y}) (${next.x} ${next.y})`
      );
    }

    // if point is a split, connect it with the previous point
    if (prev.x >= curr.x && next.x > curr.x && convex) {
      // connect (i - 1) and (i);
      connect = sortedIndex[i - 1];
      console.log(
        `split ${i} (${prev.x} ${prev.y}) (${curr.x} ${curr.y}) (${next.x} ${next.y})`
      );
    }

    if (connect != undefined) {
      const a = Math.min(index, connect);
      const b = Math.max(index, connect);

      console.log(`connect ${a} ${b}`);

      return [
        ...triangulation(
          points,
          polygon.slice(a, b + 1),
          sortedIndex.filter((x) => x >= a && x <= b).map((x) => x - a),
          1 // TODO: continue at i,
        ),
        ...triangulation(
          points,
          [...polygon.slice(0, a + 1), ...polygon.slice(b)],
          sortedIndex
            .filter((x) => x <= a || x >= b)
            .map((x) => (x >= b ? x - (b - a - 1) : x)),
          1
        ),
      ];
    }
  }

  console.log(polygon, sortedIndex);

  // Part 2.
  // montone triangulation, triangulate a monotone polygon
  const triangles = [];
  let chain = [sortedIndex[0], sortedIndex[1]];
  const chainDirectionOf = (a: number, b: number) => {
    const direction = a - b;
    if (direction === sortedIndex.length - 1) {
      return -1;
    }
    if (direction === 1 - sortedIndex.length) {
      return 1;
    }
    return direction;
  };
  let chainDirection = chainDirectionOf(chain[1], chain[0]);

  for (let i = 2; i < sortedIndex.length; ++i) {
    const index = sortedIndex[i];
    // if on the opposite chain as the current working chain
    if (chainDirectionOf(index, chain[0]) === -chainDirection) {
      if (chainDirection === 1) {
        for (let j = 1; j < chain.length; ++j) {
          triangles.push(
            polygon[chain[j - 1]],
            polygon[chain[j]],
            polygon[index]
          );
        }
      } else {
        for (let j = 1; j < chain.length; ++j) {
          triangles.push(
            polygon[chain[j]],
            polygon[chain[j - 1]],
            polygon[index]
          );
        }
      }
      chain = [chain[chain.length - 1], index];
      chainDirection = -chainDirection;
    } else {
      if (chainDirection === 1) {
        const top = points[index];
        let a = points[chain[chain.length - 1]];

        for (let j = chain.length - 2; j >= 0; --j) {
          const b = points[chain[j]];
          // if a triangle construction is legal along the same chain
          // we are guaranteed to be able to construct this triangle, and it's also necessery
          // to prevent future overlaps
          if ((top.y - a.y) * (top.x - b.x) <= (top.y - b.y) * (top.x - a.x)) {
            break;
          }
          triangles.push(
            polygon[chain[j]],
            polygon[chain[j + 1]],
            polygon[index]
          );
          chain.pop();
          a = b;
        }
      } else {
        const top = points[index];
        let a = points[chain[chain.length - 1]];

        for (let j = chain.length - 2; j >= 0; --j) {
          const b = points[chain[j]];
          // if a triangle construction is legal along the same chain
          // we are guaranteed to be able to construct this triangle, and it's also necessery
          // to prevent future overlaps
          if ((top.y - a.y) * (top.x - b.x) >= (top.y - b.y) * (top.x - a.x)) {
            break;
          }
          triangles.push(
            polygon[chain[j + 1]],
            polygon[chain[j]],
            polygon[index]
          );
          chain.pop();
          a = b;
        }
      }

      chain.push(index);
    }
  }
  return triangles;
}

export function MeshGeometry({ faces }: MeshGeometryProps) {
  const { points, normals, indices } = useMemo(() => {
    const points: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (const face of faces) {
      if (face.length < 3) {
        continue;
      }

      const indexOffset = points.length / 3;
      const normal = new Vector3(0, 0, 1);
      const perim: Vector2[] = [];
      // indices sorted by x
      //
      const polygon = [];
      for (let i = 0; i < face.length; ++i) {
        const p = face[i];
        // const n = normals ? normals[i] : normal;
        const n = normal;
        points.push(p.x, p.y, p.z);
        normals.push(n.x, n.y, n.z);

        perim.push(new Vector2(p.x, p.y)); // TODO: project onto the plane via normal
        polygon.push(i);
      }

      const sortedIndex = polygon.toSorted((a, b) =>
        perim[a].x === perim[b].x
          ? perim[a].y - perim[b].y
          : perim[a].x - perim[b].x
      );

      indices.push(
        ...triangulation(perim, polygon, sortedIndex).map(
          (x) => x + indexOffset
        )
      );
    }

    return {
      points: new Float32Array(points),
      normals: new Float32Array(normals),
      indices: new Uint16Array(indices),
    };
  }, [faces]);

  return (
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[points, 3]} />
      <bufferAttribute attach="attributes-normal" args={[normals, 3]} />
      <bufferAttribute attach="index" args={[indices, 1]} />
    </bufferGeometry>
  );
}
