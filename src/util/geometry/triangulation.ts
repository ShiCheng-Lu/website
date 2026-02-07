// TODO: move polygon triangulation herer

import { Vector2, Vector3 } from "three";
import { Polygon, lerp } from ".";

type PartialPolygon = {
  top: Vector2[];
  bot: Vector2[];
};

function y(chain: Vector2[], x: number) {
  const a = chain[chain.length - 2];
  const b = chain[chain.length - 1];
  return lerp(a, b, (x - a.x) / (b.x - a.x)).y;
}

export function toCompletePolygon(partial: PartialPolygon): Polygon {
  return partial.bot.concat(partial.top.reverse());
}

export function toCompletePolygons(partials: PartialPolygon[]): Polygon[] {
  return partials.map(toCompletePolygon);
}

/**
 * take an closed polygon and return a list of partial polygons
 * partial polygons can be passed directly into monotoneTriangulation
 * or converted to Polygon with toCompletePolygons
 */
export function monotoneDecomposition(inPolygon: Polygon): PartialPolygon[] {
  // we can rely on the fact polygon is by reference
  // const indices = new Map<Vector2, number>(polygon.map((v, i) => [v, i]));
  const polygon = inPolygon.slice(0, -1);

  const sorted = polygon
    .map((vertex, index) => ({ vertex, index }))
    .sort((a, b) => a.vertex.x - b.vertex.x);

  const polygonNext = (index: number): Vector2 => {
    return polygon[(index + 1) % polygon.length];
  };
  const polygonPrev = (index: number): Vector2 => {
    return polygon[(index === 0 ? polygon.length : index) - 1];
  };

  const completePolygons: PartialPolygon[] = [];
  const partialPolygons: PartialPolygon[] = [];

  const merges: {
    top: PartialPolygon;
    bot: PartialPolygon;
  }[] = [];

  let z = 0;
  for (const point of sorted) {
    // if (z++ > 16) {
    //   completePolygons.push(...partialPolygons);
    //   return completePolygons;
    // }
    // determine which partial polygon this point belongs to and if it should be the start of a new partial polygon
    // console.log("processing", point.vertex);

    // connect existin merge points to the new point
    for (let i = 0; i < merges.length; ++i) {
      const top = merges[i].top;
      const bot = merges[i].bot;
      // if the point is the top, then it closes the top polygon, and the bottom connects to this point
      if (point.vertex === top.top[top.top.length - 1]) {
        const completeIndex = partialPolygons.findIndex((x) => x === top);
        // console.log(`connect merge to top ${completeIndex}`);
        partialPolygons.splice(completeIndex, 1);
        completePolygons.push(top);
        // console.log(
        //   "completed",
        //   JSON.parse(JSON.stringify(top)),
        //   JSON.parse(JSON.stringify(completed))
        // );

        bot.top.push(point.vertex);
        merges.splice(i, 1);

        break;
      }
      // if the point is the bottom, then it closes the bottom polygon
      else if (point.vertex === bot.bot[bot.bot.length - 1]) {
        // console.log("connect merge to bottom");
        const completeIndex = partialPolygons.findIndex((x) => x === bot);
        partialPolygons.splice(completeIndex, 1);

        completePolygons.push(bot);

        top.bot.push(point.vertex);
        merges.splice(i, 1);
        break;
      }
      // if the point is within the trapezoid of the merge, it can be connected, this point is also a split
      // so once processed, we'll have completely processed this point
      else if (
        y(top.top, point.vertex.x) > point.vertex.y &&
        y(bot.bot, point.vertex.x) < point.vertex.y
      ) {
        top.bot.push(point.vertex);
        const topNext = polygonNext(point.index);
        top.bot.push(topNext);

        bot.top.push(point.vertex);
        const botNext = polygonPrev(point.index);
        bot.top.push(botNext);

        merges.splice(i, 1);

        break;
      }
    }

    let polygonTop: PartialPolygon | undefined = undefined;
    let polygonBot: PartialPolygon | undefined = undefined;
    for (let i = 0; i < partialPolygons.length; ++i) {
      const partial = partialPolygons[i];
      const eqTop = point.vertex === partial.top[partial.top.length - 1];
      const eqBot = point.vertex === partial.bot[partial.bot.length - 1];
      if (eqTop && eqBot) {
        // close polygon
        // console.log(`completed polygon via eq ${i}`);
        partialPolygons.splice(i, 1);
        partial.bot.pop();
        completePolygons.push(partial);

        polygonTop = undefined;
        polygonBot = partial;
        break;
      } else if (eqTop) {
        // console.log("eq top");
        polygonTop = partial;
        const next = polygonPrev(point.index);
        partial.top.push(next);
      } else if (eqBot) {
        // console.log("eq bot");
        polygonBot = partial;
        const next = polygonNext(point.index);
        partial.bot.push(next);
      }
      // this is a split vertex, we need to connect it to a previous point
      else if (
        y(partial.top, point.vertex.x) > point.vertex.y &&
        y(partial.bot, point.vertex.x) < point.vertex.y &&
        partial.top[partial.top.length - 1].x > point.vertex.x &&
        partial.bot[partial.bot.length - 1].x > point.vertex.x
      ) {
        // console.log(`${z}: split`);
        const topNext = polygonNext(point.index);
        const botNext = polygonPrev(point.index);
        // connect to the previous top/bottom with highest x, which is guranteed to
        // create a split that does not cut any other vertex
        if (
          partial.top[partial.top.length - 2].x >
          partial.bot[partial.bot.length - 2].x
        ) {
          const next = partial.top.pop()!;
          const start = partial.top[partial.top.length - 1];

          partialPolygons.push({
            top: [start, next],
            bot: [start, point.vertex, topNext],
          });

          partial.top.push(point.vertex);
          partial.top.push(botNext);
        } else {
          const next = partial.bot.pop()!;
          const start = partial.bot[partial.bot.length - 1];

          partialPolygons.push({
            top: [start, point.vertex, botNext],
            bot: [start, next],
          });

          partial.bot.push(point.vertex);
          partial.bot.push(topNext);
        }

        polygonTop = undefined;
        polygonBot = partial;
        break;
      }
    }

    //
    if (!polygonTop && !polygonBot) {
      partialPolygons.push({
        bot: [point.vertex, polygonNext(point.index)],
        top: [point.vertex, polygonPrev(point.index)],
      });
    }

    // this is a merge vertex, keep track of it to connect to the next available point
    if (polygonTop && polygonBot) {
      polygonBot.bot.pop(); // the next vertex is not correct since it's a merge
      polygonTop.top.pop();
      merges.push({
        top: polygonBot, // the polygon that matched with the bottom vertex is the top polygon in the merge
        bot: polygonTop,
      });
      // console.log(`${z}: merge at`, point.vertex);
    }

    // console.log(JSON.parse(JSON.stringify(partialPolygons)));
  }

  return [...completePolygons, ...partialPolygons];
}

export function monotoneTriangulation(polygon: PartialPolygon) {
  const triangles: [Vector2, Vector2, Vector2][] = [];

  // balance top/bottom
  let tip = polygon.top[1];
  let chain = [polygon.bot[0]];
  let ti = 1;
  let bi = 0;

  while (true) {
    bi += 1;
    while (bi < polygon.bot.length && (!tip || polygon.bot[bi].x < tip.x)) {
      const top = polygon.bot[bi];
      for (let i = chain.length - 2; i >= 0; --i) {
        const a = chain[i];
        const b = chain[i + 1];
        // triangle construction illegal, continue moving to next point
        if ((a.y - top.y) * (b.x - top.x) >= (b.y - top.y) * (a.x - top.x)) {
          break;
        }
        // if a triangle construction is legal along the same chain
        // we are guaranteed to be able to construct this triangle,
        // and it's also necessery to prevent future overlaps
        triangles.push([a, b, top]);

        chain.pop();
      }
      chain.push(top);
      bi += 1;
    }

    if (tip) {
      for (let i = 0; i < chain.length - 1; ++i) {
        triangles.push([chain[i], chain[i + 1], tip]);
      }
    } else {
      break;
    }

    chain = [chain[chain.length - 1], tip];
    tip = polygon.bot[bi];

    ti += 1;
    while (ti < polygon.top.length && (!tip || polygon.top[ti].x < tip.x)) {
      const top = polygon.top[ti];
      for (let i = chain.length - 2; i >= 0; --i) {
        const a = chain[i];
        const b = chain[i + 1];

        if ((a.y - top.y) * (b.x - top.x) <= (b.y - top.y) * (a.x - top.x)) {
          break;
        }

        triangles.push([b, a, top]);
        chain.pop();
      }

      chain.push(top);
      ti += 1;
    }
    if (tip) {
      for (let i = 0; i < chain.length - 1; ++i) {
        triangles.push([chain[i + 1], chain[i], tip]);
      }
    } else {
      break;
    }

    chain = [chain[chain.length - 1], tip];
    tip = polygon.top[ti];
  }

  return triangles;
}

export default function triangulation(polygon: Polygon) {
  const polygons = monotoneDecomposition(polygon);
  // console.log(`decomponsed to ${polygons.length}`, polygons);
  const triangles = polygons.flatMap((polygon) =>
    monotoneTriangulation(polygon)
  );
  return triangles;
}

export function toIndices(polygon: Polygon, vertices: Vector2[]): number[] {
  const vertexToIndex = new Map<Vector2, number>(
    polygon.slice(0, -1).map((point, i) => {
      return [point, i];
    })
  );
  const indices = vertices.map((v) => vertexToIndex.get(v)!);
  return indices;
}
