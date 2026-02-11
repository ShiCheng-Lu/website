import { Vector2 } from "three";
import { Polygon, lerp } from ".";

// Point in polygon algorithm by casting a line (vertical) and checking the number of
// intersections, odd number means we entered, even number means we exited
export function inside(point: Vector2, polygon: Polygon): boolean {
  let intersections = 0;
  for (let i = 0; i < polygon.length - 1; ++i) {
    const p0 = polygon[i];
    const p1 = polygon[i + 1];
    if (p0.x < point.x != p1.x < point.x) {
      // this is a segment that crosses, find if we've crossed above or below a[0]
      const y = lerp(p0, p1, (point.x - p0.x) / (p1.x - p0.x)).y;

      if (y > point.y) {
        intersections++;
      }
    }
  }
  return intersections % 2 === 1;
}

type BoundingBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
export function boundingBox(polygon: Polygon): BoundingBox {
  return polygon.reduce(
    (bounds, current) => ({
      minX: Math.min(bounds.minX, current.x),
      minY: Math.min(bounds.minY, current.y),
      maxX: Math.max(bounds.maxX, current.x),
      maxY: Math.max(bounds.maxY, current.y),
    }),
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    }
  );
}

export function intersection(a: Polygon, b: Polygon): Polygon[] {
  // always want a to be shorter than b, so that when we loop over a, it's optimized
  if (a.length > b.length) {
    return intersection(b, a);
  }

  // simple test for bounding box intersection
  const aBounds = boundingBox(a);
  const bBounds = boundingBox(b);
  if (
    // bounding box don't intersect, so the polygon cannot intersect
    aBounds.minX >= bBounds.maxX ||
    aBounds.minY >= bBounds.maxY ||
    aBounds.maxX <= bBounds.minX ||
    aBounds.maxY <= bBounds.minY
  ) {
    return [];
  }

  // this Vector3 is shared until index is re-assigned
  const aIntersects: [number, number][][] = new Array(a.length - 1)
    .fill(0)
    .map(() => []);
  const bIntersects: [number, number][][] = new Array(b.length - 1)
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
    // use point in polygon to find if a[0] is inside
    if (inside(a[0], b)) {
      return [a.map((p) => p.clone())];
    }
    if (inside(b[0], a)) {
      return [b.map((p) => p.clone())];
    }
    return [];
  }

  while (entry !== -1) {
    let current = 0; // current polygon, 0 = a, 1 = b
    let i = 0;
    let d = 0;
    // calculate how to start the polygon

    // the start will be the entry index, or on b where entry intersects
    const points = [];

    const [oi, distance] = aIntersects[entry][0];
    const other = bIntersects[oi].findIndex(([x, _]) => x === entry);

    if (other === -1) {
      const err = "failed to find the corresponding intersection";
      console.error(err);
      throw err;
    }

    points.push(lerp(a[entry], a[entry + 1], distance));

    const aDiff = a[entry + 1].clone().sub(a[entry]);
    const bDiff = b[oi + 1].clone().sub(b[oi]);

    // basically cross product's Z, > 0 if A transition to B during this intersect
    // and < 0 if B transition to A during this intersect
    if (aDiff.x * bDiff.y - aDiff.y * bDiff.x > 0) {
      current = 1;
      i = oi;
      d = bIntersects[oi][other][1];
      bIntersects[oi].splice(other, 1);
      // console.log(`A to B ${JSON.stringify(points[0])}`);
    } else {
      current = 0;
      i = entry;
      d = distance;
      aIntersects[i].splice(0, 1);
      // console.log(`B to A ${JSON.stringify(points[0])}`);
    }

    while (true) {
      // follow the path to the next intersection
      const polygon = current ? b : a;
      const intersects = current ? bIntersects : aIntersects;
      const otherIntersects = current ? aIntersects : bIntersects;
      const length = (current ? b.length : a.length) - 1;
      let intersectIndex = -1;

      while (true) {
        intersectIndex = intersects[i].findIndex(([_, dist]) => dist > d);
        if (intersectIndex !== -1) {
          break;
        }
        i++;
        if (i >= length) {
          i = 0;
        }
        // add point to our polygon
        points.push(polygon[i].clone());
        // d resets since we're starting from a new point
        d = 0;
      }

      // console.log(`intersected ${JSON.stringify(points)}`);

      // remove this intersection since this'll be the only ever time we need
      // to process this intersection, and by removing it, the next intersection
      // of the edge is going to be the true next edge in sequence
      // This shift() is guaranteed to succeed ensured by the while condition from above
      const [oi, distance] = intersects[i].splice(intersectIndex, 1)[0];

      points.push(lerp(polygon[i], polygon[i + 1], distance));

      const rm_index = otherIntersects[oi].findIndex(([a, _]) => a === i);
      if (rm_index === -1) {
        // if there is no matching intersection, this is the intersection we started from
        // TODO: complete the polygon and break out
        break;
      }
      const [_, dist] = otherIntersects[oi].splice(rm_index, 1)[0];

      // add point to our polygon
      current = 1 - current;
      i = oi;
      d = dist;
    }

    newPolygons.push(points);
    // get next entry points since we can have multiple polygon results
    entry = aIntersects.findIndex((array) => array.length !== 0);
  }

  return newPolygons;
}
