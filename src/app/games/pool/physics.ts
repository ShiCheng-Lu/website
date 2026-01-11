import { Euler, Quaternion, Vector2, Vector3 } from "three";

export const BALL_DIAMETER = 2.25;
export const TABLE_WIDTH = 50;

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
  { x: 0, y: 0, color: "red" },
  { x: -1, y: 1, color: "red" },
  { x: 1, y: 1, color: "yellow" },
  { x: -2, y: 2, color: "yellow" },
  { x: 0, y: 2, color: "black" },
  { x: 2, y: 2, color: "red" },
  { x: -3, y: 3, color: "red" },
  { x: -1, y: 3, color: "yellow" },
  { x: 1, y: 3, color: "red" },
  { x: 3, y: 3, color: "yellow" },
  { x: -4, y: 4, color: "yellow" },
  { x: -2, y: 4, color: "red" },
  { x: 0, y: 4, color: "yellow" },
  { x: 2, y: 4, color: "yellow" },
  { x: 4, y: 4, color: "red" },
];
const OFFSET_X = BALL_DIAMETER / 2;
const OFFSET_Y = (BALL_DIAMETER * Math.sqrt(3)) / 2;

function matrix(dim: number[], value: any): any {
  if (dim.length < 1) {
    return 0;
  }
  const array = new Array(dim[0]).fill(value);
  if (dim.length == 1) {
    return array;
  }
  return array.map(() => matrix(dim.slice(1), value));
}

export default class PoolGame {
  balls: PhysicsState[];
  cue: Vector3;
  player: number;
  turn: number;

  constructor() {
    this.balls = [
      {
        position: new Vector3(0, -20, 0),
        velocity: new Vector3(),
        angular_velocity: new Vector3(),
        angular_position: new Quaternion(),
        color: "white",
      },
      ...POOL_STATE.map((ball) => ({
        position: new Vector3(ball.x * OFFSET_X, ball.y * OFFSET_Y, 0),
        velocity: new Vector3(),
        angular_velocity: new Vector3(),
        angular_position: new Quaternion(),
        color: ball.color,
      })),
    ];
    this.player = 0;
    this.turn = 0;
    this.cue = new Vector3();
  }

  update(mouse: Vector2): SyncState {
    const sync = {};

    // calculate new position
    const positions = this.balls.map((ball) => {
      return ball.position.clone().add(ball.velocity);
    });

    // calculate collision, limit position to right before the collision
    // calculate new velocity
    const velocities = this.balls.map((ball) => {
      return ball.velocity.clone();
    });
    // overlaps
    const overlaps: boolean[][] = matrix(
      [this.balls.length, this.balls.length],
      false
    );
    for (let i = 0; i < this.balls.length; ++i) {
      for (let j = i + 1; j < this.balls.length; ++j) {
        // collision between balls[i] and balls[j]
        if (positions[i].distanceTo(positions[j]) < BALL_DIAMETER) {
          overlaps[i][j] = true;
          overlaps[j][i] = true;
          console.log("collided");
        }
      }
    }

    // apply force to other ball
    for (let i = 0; i < this.balls.length; ++i) {
      let total_collision_mass = 0;
      for (let j = 0; j < this.balls.length; ++j) {
        if (overlaps[i][j]) {
          total_collision_mass += 1;
        }
      }
      for (let j = 0; j < this.balls.length; ++j) {
        if (overlaps[i][j]) {
          const direction = positions[j].clone().sub(positions[i]).normalize();
          const velocity = this.balls[i].velocity.clone();
          // cosine determines how much energy is transfered
          const energy = direction.dot(velocity) / total_collision_mass;

          if (energy > 0) {
            const transfered = direction.multiplyScalar(energy);
            velocities[j].add(transfered);
            velocities[i].sub(transfered);
          }
        }
      }
    }

    // update position
    for (let i = 0; i < this.balls.length; ++i) {
      this.balls[i].position.copy(positions[i]);
    }

    // update velocity
    for (let i = 0; i < this.balls.length; ++i) {
      // if the velocity is already super low, just stop the ball
      const friction = velocities[i].lengthSq() < 1e-9 ? 0 : 0.997;
      velocities[i].multiplyScalar(friction);

      this.balls[i].velocity.copy(velocities[i]);
    }

    return sync;
  }

  test() {
    console.log("Test here");
    // do something,
    this.balls[0].velocity = new Vector3(0, 0.1, 0);
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
