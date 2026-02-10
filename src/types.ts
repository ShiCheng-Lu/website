import { Vector2, Vector3 } from "three";

type PingPongData = {
  paddle?: Vector2;
  ball?: Vector3;
  target?: Vector3;
  score?: [number, number];
};
