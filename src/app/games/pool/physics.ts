import { Euler, Quaternion, Vector2, Vector3 } from "three";

type RenderState = {
  position: Vector3;
  angular_position: Euler;
  color: string;
};

type PhysicsState = {
  position: Vector3;
  velocity: Vector3;
  angular_position: Quaternion;
  angular_velocity: Vector3;
  color: string;
};

export type SyncState = {
  ball?: Vector3;
  direction?: Vector3; // also power
};

export type GameState = {
  balls: RenderState[];
};

const POOL_STATE = [
  // { x: , y: , color: 'yellow' },
];

export default class PoolGame {
  balls: PhysicsState[];
  cue: Vector3;
  player: number;
  turn: number;

  constructor() {
    this.balls = [
      {
        position: new Vector3(0, 20, 0),
        velocity: new Vector3(),
        angular_velocity: new Vector3(),
        angular_position: new Quaternion(),
        color: "red",
      },
      {
        position: new Vector3(0, -20, 0),
        velocity: new Vector3(),
        angular_velocity: new Vector3(),
        angular_position: new Quaternion(),
        color: "white",
      },
    ];
    this.player = 0;
    this.turn = 0;
    this.cue = new Vector3();
  }

  update(mouse: Vector2): SyncState {
    const sync = {};

    // update position
    for (const ball of this.balls) {
      ball.position.add(ball.velocity);
    }

    // update velocity
    for (const ball of this.balls) {
      // if the velocity is already super low, just stop the ball
      const friction = ball.velocity.lengthSq() < 1e-9 ? 0 : 0.9;
      ball.velocity.multiplyScalar(friction);

      ball.angular_position;
    }

    return sync;
  }

  state(): GameState {
    return {
      balls: this.balls.map((ball) => ({
        position: ball.position.clone(),
        angular_position: new Euler().setFromQuaternion(ball.angular_position),
        color: ball.color,
      })),
    };
  }

  reset() {
    this.player = 0;
    this.turn = 0;
  }
}
