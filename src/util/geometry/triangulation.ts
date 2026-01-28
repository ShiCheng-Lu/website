// TODO: move polygon triangulation herer

import { Vector2, Vector3 } from "three";

export default function triangulation(
  points: Vector2[],
  polygon: number[],
  sortedIndex: number[],
  start: number = 1
): Vector3[] {
  if (polygon.length <= 3) {
    return [new Vector3(polygon[0], polygon[1], polygon[2])];
  }

  const indexOf = (i: number) => {
    if (i >= polygon.length) {
      return i - polygon.length;
    }
    if (i < 0) {
      return i + polygon.length;
    }
    return i;
  };
  // TODO: something doesn't exactly work right with this...
  console.log(polygon);
  // Part 1.
  // Monotone decomposition, split polygon into polygons that are monotone in x
  for (let i = start; i < sortedIndex.length - 1; ++i) {
    const index = sortedIndex[i];
    const prev = points[polygon[indexOf(index - 1)]];
    const next = points[polygon[indexOf(index + 1)]];
    const curr = points[polygon[index]];

    // if point is a merge, connect it with the next point
    let connect = undefined;
    const convex =
      (prev.y - curr.y) * (next.x - curr.x) <=
      (next.y - curr.y) * (prev.x - curr.x);
    if (prev.x <= curr.x && next.x < curr.x && convex) {
      // connect (i) and (i + 1);
      connect = sortedIndex[i + 1];
      // console.log(
      //   `merge ${i} (${prev.x} ${prev.y}) (${curr.x} ${curr.y}) (${next.x} ${next.y})`
      // );
    }

    // if point is a split, connect it with the previous point
    if (prev.x >= curr.x && next.x > curr.x && convex) {
      // connect (i - 1) and (i);
      connect = sortedIndex[i - 1];
      // console.log(
      //   `split ${i} (${prev.x} ${prev.y}) (${curr.x} ${curr.y}) (${next.x} ${next.y})`
      // );
    }

    if (connect != undefined) {
      const a = Math.min(index, connect);
      const b = Math.max(index, connect);

      // console.log(`connect ${a} ${b}`);
      // TODO?: start index might not be correct

      const sortedA = sortedIndex.filter((x) => x >= a && x <= b);
      const sortedB = sortedIndex.filter((x) => x <= a || x >= b);

      return [
        // ...triangulation(
        //   points,
        //   polygon.slice(a, b + 1),
        //   sortedA.map((x) => x - a),
        //   sortedA.filter((x) => points[polygon[x]].x < points[polygon[index]].x)
        //     .length
        // ),
        // ...triangulation(
        //   points,
        //   [...polygon.slice(0, a + 1), ...polygon.slice(b)],
        //   sortedB.map((x) => (x >= b ? x - (b - a - 1) : x)),
        //   sortedB.filter((x) => points[polygon[x]].x < points[polygon[index]].x)
        //     .length
        // ),
      ];
    }
  }

  // Part 2.
  // Monotone triangulation, triangulate a monotone polygon
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
            new Vector3(
              polygon[chain[j - 1]],
              polygon[chain[j]],
              polygon[index]
            )
          );
        }
      } else {
        for (let j = 1; j < chain.length; ++j) {
          triangles.push(
            new Vector3(
              polygon[chain[j]],
              polygon[chain[j - 1]],
              polygon[index]
            )
          );
        }
      }
      chain = [chain[chain.length - 1], index];
      chainDirection = -chainDirection;
    } else {
      if (chainDirection === 1) {
        const top = points[polygon[index]];
        let a = points[polygon[chain[chain.length - 1]]];

        for (let j = chain.length - 2; j >= 0; --j) {
          const b = points[polygon[chain[j]]];
          // if a triangle construction is legal along the same chain
          // we are guaranteed to be able to construct this triangle, and it's also necessery
          // to prevent future overlaps
          if ((a.y - top.y) * (b.x - top.x) <= (b.y - top.y) * (a.x - top.x)) {
            break;
          }
          triangles.push(
            new Vector3(
              polygon[chain[j]],
              polygon[chain[j + 1]],
              polygon[index]
            )
          );
          chain.pop();
          a = b;
        }
      } else {
        const top = points[polygon[index]];
        let a = points[polygon[chain[chain.length - 1]]];

        for (let j = chain.length - 2; j >= 0; --j) {
          const b = points[polygon[chain[j]]];
          // if a triangle construction is legal along the same chain
          // we are guaranteed to be able to construct this triangle, and it's also necessery
          // to prevent future overlaps
          if ((top.y - a.y) * (top.x - b.x) >= (top.y - b.y) * (top.x - a.x)) {
            break;
          }
          triangles.push(
            new Vector3(
              polygon[chain[j + 1]],
              polygon[chain[j]],
              polygon[index]
            )
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
