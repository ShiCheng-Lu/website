import { Euler, Quaternion, Vector2, Vector3 } from "three";

export const BALL_DIAMETER = 2.25;
export const TABLE_WIDTH = 50;
export const CUE_LENGTH = 36;

type RenderState = {
  position: Vector3;
  rotation: Euler;
};

type BallRenderState = RenderState & {
  color: string;
};

type PhysicsState = {
  position: Vector3;
  velocity: Vector3;
  angular_position: Quaternion;
  angular_velocity: Vector3;
};

type BallPhysicsState = PhysicsState & {
  color: string;
};

export type SyncState = {
  ball?: Vector3;
  direction?: Vector3; // also power
};

export type GameState = {
  balls: BallRenderState[];
  cue: RenderState;
  anchor: RenderState;
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
  balls: BallPhysicsState[];
  cue: PhysicsState;
  anchor: RenderState; // don't keep to track velocity for anchor

  player: number;
  turn: number;
  pressed: string;

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
        position: new Vector3(
          ball.x * OFFSET_X,
          ball.y * OFFSET_Y + TABLE_WIDTH / 2,
          0
        ),
        velocity: new Vector3(),
        angular_velocity: new Vector3(),
        angular_position: new Quaternion(),
        color: ball.color,
      })),
    ];
    this.player = 0;
    this.turn = 0;
    this.cue = {
      position: new Vector3(0, 0, 0),
      velocity: new Vector3(),
      angular_velocity: new Vector3(),
      angular_position: new Quaternion(),
    };
    this.anchor = {
      position: new Vector3(0, -10, 0),
      rotation: new Euler(),
    };
    this.pressed = "";
  }

  update(mouse: Vector2, pressed: boolean): SyncState {
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

    // cue collision
    if (
      this.cue.velocity.lengthSq() != 0 &&
      velocities[0].lengthSq() == 0 &&
      this.cue.position.distanceTo(positions[0]) < BALL_DIAMETER / 2
    ) {
      // TODO: collide with cue position to add spin
      velocities[0].add(this.cue.velocity.clone());
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

    // TODO: we should only process input on real ticks, for smooth cue velocity
    // maybe split update and input

    // process input
    if (pressed && !this.pressed) {
      // mouse down

      const handleLocation = new Vector3(0, -CUE_LENGTH, 0);
      handleLocation.applyQuaternion(this.cue.angular_position);
      handleLocation.add(this.cue.position);

      if (mouse.distanceTo(handleLocation) < BALL_DIAMETER * 2) {
        // trying to move the cue
        this.pressed = "cue";
        // immediately set the cue position so that the initial click don't trigger
        // a forward motion, (which will attempt to hit the cue ball)
        this.cue.position.copy({ ...mouse, z: 0 });
      } else if (mouse.distanceTo(this.anchor.position) < BALL_DIAMETER) {
        this.pressed = "anchor";
      } else if (mouse.distanceTo(this.balls[0].position) < BALL_DIAMETER / 2) {
        // trying to pick up the cue ball
        this.pressed = "ball";
      }

      console.log(this.pressed);
    }

    if (pressed && this.pressed) {
      if (this.pressed === "cue") {
        // if the next position is close to the anchor than previous, then we've pushing the
        // cue forward, so set a cue velocity, which will be able to collide with the ball

        // calculate  the tip position, and cue angle at the sime time
        const tip = new Vector3(mouse.x, mouse.y, 0).sub(this.anchor.position);
        const angle = Math.atan2(tip.x, -tip.y);
        const dist = Math.min(tip.length() - CUE_LENGTH, -BALL_DIAMETER);
        tip.normalize().multiplyScalar(dist).add(this.anchor.position);

        // update the cue to point towards the anchor
        this.cue.angular_position = new Quaternion().setFromAxisAngle(
          new Vector3(0, 0, 1),
          angle
        );

        if (
          this.cue.position.distanceTo(this.anchor.position) <
          tip.distanceTo(this.anchor.position)
        ) {
          this.cue.velocity = tip.clone().sub(this.cue.position);
        } else {
          this.cue.velocity = new Vector3();
        }

        this.cue.position.copy(tip);
      }
      if (this.pressed === "ball") {
        // TODO: not allow ball to be placed inside other balls
        this.balls[0].position.copy({ ...mouse, z: 0 });
      }
      if (this.pressed === "anchor") {
        // move the cue along with the anchor
        this.cue.position.sub(this.anchor.position);
        this.anchor.position.copy({ ...mouse, z: 0 });
        this.cue.position.add(this.anchor.position);
      }
    }

    if (!pressed && this.pressed) {
      this.pressed = "";
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
        rotation: new Euler().setFromQuaternion(ball.angular_position),
        color: ball.color,
      })),
      cue: {
        position: this.cue.position.clone(),
        rotation: new Euler().setFromQuaternion(this.cue.angular_position),
      },
      anchor: {
        position: this.anchor.position.clone(),
        rotation: this.anchor.rotation.clone(),
      },
    };
  }

  reset() {}
}
