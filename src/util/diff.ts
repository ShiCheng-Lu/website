import { matrix } from "./util";

export function matrixDiff(a: string, b: string): number[][] {
  const d: number[][] = matrix([a.length, b.length], Infinity);

  d[0][0] = a[0] === b[0] ? 0 : 1;
  for (let bi = 1; bi < b.length; ++bi) {
    d[0][bi] = a[0] === b[bi] ? bi : bi + 1;
  }

  for (let ai = 1; ai < a.length; ++ai) {
    // first item
    d[ai][0] = a[ai] === b[0] ? ai : ai + 1;

    for (let bi = 1; bi < b.length; ++bi) {
      // for diagonal, if the current two is the same, there's no replace
      // diagonal is free, so we sub 1 since we're adding 1 to the cost after
      // this is to save one addition
      const diagCost = d[ai - 1][bi - 1];
      d[ai][bi] =
        Math.min(
          a[ai] === b[bi] ? diagCost - 1 : diagCost,
          d[ai - 1][bi],
          d[ai][bi - 1]
        ) + 1;
    }
  }
  return d;
}

/**
 * return the diff distance between two strings
 * add cost 1
 * subtract cost 1
 * replace cost 1
 * @param a
 * @param b
 */
export function stringDiff(a: string, b: string): number {
  const d = matrixDiff(a, b);
  return d[a.length - 1][b.length - 1];
}

export function stringDiffWithin(a: string, b: string): number {
  const d = matrixDiff(a, b);
  if (a.length < b.length) {
    return d[a.length - 1][b.length - 1];
  }

  let min = Infinity;
  for (let i = b.length; i < a.length; ++i) {
    min = Math.min(d[i][b.length - 1] - i + b.length, min);
  }
  return min;
}
