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
