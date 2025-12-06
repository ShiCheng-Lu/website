export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function abs({ x, y }: Point): number {
  return Math.sqrt(x * x + y * y);
}

export function div(a: Point, b: number): Point {
  return { x: a.x / b, y: a.y / b };
}

export function mul(a: Point, b: number): Point {
  return { x: a.x * b, y: a.y * b };
}
