import { Vector3 } from "three";

const bit_patterns = [0x15, 0x38, 0x32, 0x2c, 0x0d, 0x13, 0x07, 0x2a];

function contributionOf(vertex: Vector3, point: Vector3): number {
  const distance = vertex.clone().sub(point);
  distance.subScalar((distance.x + distance.y + distance.z) / 6);

  const contribution = 0.5 - distance.lengthSq();
  if (contribution <= 0) return 0;

  const int_vertex = vertex.clone().floor();
  let bit_pattern = 0;
  for (let i = 0; i < 8; ++i) {
    const pattern_index =
      (((int_vertex.x >> i) & 1) << 2) +
      (((int_vertex.y >> i) & 1) << 1) +
      ((int_vertex.z >> i) & 1);
    bit_pattern += bit_patterns[pattern_index];
  }
  const b5 = (bit_pattern >> 5) & 1;
  const b4 = (bit_pattern >> 4) & 1;
  const b3 = (bit_pattern >> 3) & 1;
  const b2 = (bit_pattern >> 2) & 1;
  const shift = bit_pattern & 0b11;

  let shift_distance;
  if (shift === 1) {
    shift_distance = new Vector3(distance.y, distance.z, distance.x);
  } else if (shift === 2) {
    shift_distance = new Vector3(distance.z, distance.x, distance.y);
  } else {
    shift_distance = distance.clone();
  }

  let result = b5 === b3 ? shift_distance.x : -shift_distance.x;
  if (shift == 0) {
    result += b5 === b4 ? shift_distance.y : -shift_distance.y;
    result += b5 !== (b4 ^ b3) ? shift_distance.z : -shift_distance.z;
  } else if (b2) {
    result += b5 === b4 ? shift_distance.y : -shift_distance.y;
  } else {
    result += b5 != (b4 ^ b3) ? shift_distance.z : -shift_distance.z;
  }

  const contribution2 = contribution * contribution;
  result *= 8 * contribution2 * contribution2;
  return result;
}

export function noise(point: Vector3) {
  const skewed_point = point.clone();
  skewed_point.addScalar((point.x + point.y + point.z) / 3);

  const skewed_simplex_corner = skewed_point.clone().floor();
  const internal_coordinates = skewed_point.clone().sub(skewed_simplex_corner);
  // find out which simplex of the cube the Point belongs to
  let max_index: "x" | "y" | "z";
  let mid_index: "x" | "y" | "z";
  let min_index: "x" | "y" | "z";
  if (internal_coordinates.x > internal_coordinates.y) {
    if (internal_coordinates.y > internal_coordinates.z) {
      max_index = "x";
      mid_index = "y";
      min_index = "z";
    } else if (internal_coordinates.x > internal_coordinates.z) {
      max_index = "x";
      mid_index = "z";
      min_index = "y";
    } else {
      // internal_coordinates.z > internal_coordinates.x
      max_index = "z";
      mid_index = "x";
      min_index = "y";
    }
  } else {
    // internal_coordinates.y > internal_coordinates.x
    if (internal_coordinates.x > internal_coordinates.z) {
      max_index = "y";
      mid_index = "x";
      min_index = "z";
    } else if (internal_coordinates.y > internal_coordinates.z) {
      max_index = "y";
      mid_index = "z";
      min_index = "x";
    } else {
      // internal_coordinates.z > internal_coordinates.y
      max_index = "z";
      mid_index = "y";
      min_index = "x";
    }
  }

  let result = 0;
  result += contributionOf(skewed_simplex_corner, skewed_point);
  skewed_simplex_corner[max_index] += 1;
  result += contributionOf(skewed_simplex_corner, skewed_point);
  skewed_simplex_corner[mid_index] += 1;
  result += contributionOf(skewed_simplex_corner, skewed_point);
  skewed_simplex_corner[min_index] += 1;
  result += contributionOf(skewed_simplex_corner, skewed_point);
  return result;
}
