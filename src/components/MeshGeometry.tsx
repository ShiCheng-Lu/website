import { useMemo } from "react";
import { Vector2, Vector3 } from "three";

type MeshGeometryProps = {
  faces: Vector3[][];
};

function monotoneDecomposition(
  points: Vector2[],
  polygon: number[],
  sortedIndex: number[]
) {
  for (let i = 0; i < sortedIndex.length; ++i) {}
}

// triangulate a monotonic polygon
function monotoneTriangulation(
  points: Vector2[],
  polygon: number[],
  sortedIndex: number[]
) {
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
  console.log(polygon, sortedIndex, chainDirection);

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
        // let angle =
      } else {
      }

      chain.push(index);
    }
  }
  return triangles;
}

function triangulation(points: Vector2[], polygon: number[]) {}

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
      const index = [];
      for (let i = 0; i < face.length; ++i) {
        const p = face[i];
        // const n = normals ? normals[i] : normal;
        const n = normal;
        points.push(p.x, p.y, p.z);
        normals.push(n.x, n.y, n.z);

        perim.push(new Vector2(p.x, p.y)); // TODO: project onto the plane via normal
        index.push(i);
      }

      // partition into monotone polygons
      // for now, assume it's monotone in x
      const sortedIndex = index.toSorted((a, b) =>
        perim[a].x === perim[b].x
          ? perim[a].y - perim[b].y
          : perim[a].x - perim[b].x
      );

      console.log("triangles");
      indices.push(
        ...monotoneTriangulation(
          perim,
          index.map((i) => i),
          sortedIndex
        ).map((x) => x + indexOffset)
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
