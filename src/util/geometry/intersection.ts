import { Vector3 } from "three";
import { Polygon } from ".";
import { matrix } from "../util";
import { Vector2 } from "three";

export function intersection(a: Polygon, b: Polygon): Polygon[] {
  // always want a to be shorter than b, so that when we loop over a, it's optimized
  if (a.length > b.length) {
    return intersection(b, a);
  }

  // this Vector3 is shared until index is re-assigned
  const aIntersects: [number, number][][] = new Array(b.length - 1)
    .fill(0)
    .map(() => []);
  const bIntersects: [number, number][][] = new Array(a.length - 1)
    .fill(0)
    .map(() => []);

  // calculate intersection between all pairs
  for (let ai = 0; ai < a.length - 1; ++ai) {
    for (let bi = 0; bi < b.length - 1; ++bi) {
      // solve line intersection
      // (1 - ax) * a[ai] + ax * a[ai + 1] == (1 - bx) * b[bi] + bx * b[bi + 1]
      const A00 = a[ai + 1].x - a[ai].x;
      const A01 = b[bi].x - b[bi + 1].x;
      const A10 = a[ai + 1].y - a[ai].y;
      const A11 = b[bi].y - b[bi + 1].y;

      const B0 = b[bi].x - a[ai].x;
      const B1 = b[bi].y - a[ai].y;

      const det = A00 * A11 - A10 * A01;
      // determinant is 0, so they're parallel (?) so theres no collision
      if (det === 0) {
        continue;
      }
      const ax = (B0 * A11 - B1 * A01) / det;
      const bx = (B1 * A00 - B0 * A10) / det;

      if (ax > 0 && ax < 1 && bx > 0 && bx < 1) {
        aIntersects[ai].push([bi, ax]);
        bIntersects[bi].push([ai, bx]);
      }
      if (ax === 0 || ax === 1 || bx === 0 || bx === 1) {
        // edge case detected, we're going to need to do something
        console.error(
          `intersection edge case from (${JSON.stringify(
            a[ai]
          )} - ${JSON.stringify(a[ai + 1])}) with (${JSON.stringify(
            b[bi]
          )} - ${JSON.stringify(b[bi + 1])}) at ${ax} and ${bx}`
        );
      }
    }
  }
  // sort intersection by distance to reach them
  aIntersects.forEach((array) => array.sort((a, b) => a[1] - b[1]));
  bIntersects.forEach((array) => array.sort((a, b) => a[1] - b[1]));

  const newPolygons: Polygon[] = [];

  // TODO: let's not worry about edge cases where intersection occurs exactly on the point

  // find an entry point to the inner loop
  let entry = aIntersects.findIndex((array) => array.length !== 0);

  // no entry point, we need to find if one is entirely contained within the other
  if (entry === -1) {
    // intersect vertical line at b[0] with a, if there's intersection above and below
    // then one point of b is inside a, which means all of b is inside a
    // intersect vertical line at a[0] with b, same logic, a must be inside b
    // else there's no intersection

    return [];
  }

  while (entry !== -1) {
    let current = 0; // current polygon, 0 = a, 1 = b
    let i = 0;
    // calculate how to start the polygon

    // the start will be the entry index, or on b where entry intersects
    const points = [];

    while (true) {
      // follow the path to the next intersection
      const polygon = current ? b : a;
      const intersects = current ? bIntersects : aIntersects;
      const length = (current ? b.length : a.length) - 1;
      while (intersects[i].length <= 0) {
        i++;
        if (i >= length) {
          i = 0;
        }
        // add point to our polygon
        points.push(polygon[i]);
      }

      // there's an intersection, we add the point and
      a[i];

      // remove this intersection since this'll be the only ever time we need
      // to process this intersection, and by removing it, the next intersection
      // of the edge is going to be the true next edge in sequence
      // This shift() is guaranteed to succeed ensured by the while condition from above
      const [oi, distance] = intersects[i].shift()!;
      const rm_index = intersects[oi].findIndex(([a, _]) => a === i);
      if (rm_index === -1) {
        // if there is no matching intersection, this is the intersection we started from
        // TODO: complete the polygon and break out
        break;
      }
      intersects[oi].splice(rm_index);

      // add point to our polygon
      current = 1 - current;
      i = oi;
    }

    // get next entry points since we can have multiple polygon results
    entry = aIntersects.findIndex((array) => array.length !== 0);
  }

  return newPolygons;
}
