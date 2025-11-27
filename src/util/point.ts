export type Point = { x: number; y: number };

export function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function abs({ x, y }: Point) {
  return Math.sqrt(x * x + y * y);
}

export function div(a: Point, b: number): Point {
  return { x: a.x / b, y: a.y / b };
}

export function mul(a: Point, b: number): Point {
  return { x: a.x * b, y: a.y * b };
}
