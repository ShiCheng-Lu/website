import { Vector3 } from "three";

export type Geometry = {
  vertices: Vector3[];
  normals: Vector3[];
  indices: Vector3[];
};

// modified geometry in place
function subdivide(geometry: Geometry): Geometry {
  const v = geometry.vertices;
  const n = geometry.normals;
  const indices = geometry.indices.flatMap((face) => {
    const a = v[face.x].clone().add(v[face.y]).divideScalar(2);
    const b = v[face.y].clone().add(v[face.z]).divideScalar(2);
    const c = v[face.z].clone().add(v[face.x]).divideScalar(2);
    const ai = v.length;
    const bi = ai + 1;
    const ci = ai + 2;
    v.push(a, b, c);
    n.push(a.clone(), b.clone(), c.clone());
    return [
      new Vector3(face.x, ai, ci),
      new Vector3(face.y, bi, ai),
      new Vector3(face.z, ci, bi),
      new Vector3(ai, bi, ci),
    ];
  });
  return { vertices: v, normals: n, indices };
}

function icosahedron(): Geometry {
  const phi = (1 + Math.sqrt(5)) / 2;

  const vertices = [
    // rect on xy plane
    new Vector3(1, phi, 0),
    new Vector3(-1, phi, 0),
    new Vector3(-1, -phi, 0),
    new Vector3(1, -phi, 0),
    // rect on yz plane
    new Vector3(0, 1, phi),
    new Vector3(0, -1, phi),
    new Vector3(0, -1, -phi),
    new Vector3(0, 1, -phi),
    // rect on zx plane
    new Vector3(phi, 0, 1),
    new Vector3(phi, 0, -1),
    new Vector3(-phi, 0, -1),
    new Vector3(-phi, 0, 1),
  ].map((v) => v.normalize());
  const normals = vertices.map((v) => v.clone());
  const indices = [
    // 6 side triangles
    ...[
      [0, 1, 0],
      [1, 0, 3],
      [2, 3, 1],
      [3, 2, 2],
    ].flatMap(([a, b, c]) => [
      new Vector3(a + 0, b + 0, c + 4),
      new Vector3(c + 8, a + 4, b + 4),
      new Vector3(b + 8, c + 0, a + 8),
    ]),
    // 8 corner triangles
    new Vector3(0, 4, 8),
    new Vector3(0, 9, 7),
    new Vector3(1, 7, 10),
    new Vector3(1, 11, 4),
    new Vector3(2, 10, 6),
    new Vector3(2, 5, 11),
    new Vector3(3, 8, 5),
    new Vector3(3, 6, 9),
  ];
  return { vertices, normals, indices };
}

export function icosphere(detail: number = 0) {
  let geometry = icosahedron();
  for (let i = 0; i < detail; ++i) {
    geometry = subdivide(geometry);
  }
  geometry.vertices.forEach((v) => v.normalize());
  geometry.normals = geometry.vertices.map((v) => v.clone());
  return geometry;
}
