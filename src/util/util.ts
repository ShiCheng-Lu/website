export function intersection<T>(
  a: Set<T>,
  b: Set<T>,
  compare?: (a: T, b: T) => boolean
): Set<T> {
  const newSet = new Set<T>();
  for (const ai of a) {
    for (const bi of b) {
      if (compare ? compare(ai, bi) : ai === bi) {
        newSet.add(ai);
      }
    }
  }
  return newSet;
}

export function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function urlencode(object: any) {
  return Object.entries(object)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function matrix(dim: number[], value: any): any {
  if (dim.length < 1) {
    return 0;
  }
  const array = new Array(dim[0]).fill(value);
  if (dim.length == 1) {
    return array;
  }
  return array.map(() => matrix(dim.slice(1), value));
}
