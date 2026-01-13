import { Euler, Quaternion, Vector2, Vector3 } from "three";

export const BALL_DIAMETER = 2.25;
export const TABLE_WIDTH = 50;
export const CORNER_ANGLE = 142; // 142 +- 1
export const CORNER_MOUTH = 4.5; // 4.5 - 4.625
export const CORNER_SHELF = 1; // 1 - 2.25
export const SIDE_ANGLE = 104; // 104 +- 1
export const SIDE_MOUTH = CORNER_MOUTH + 0.5;
export const SIDE_SHELF = 0; // 0 - 0.375
export const CUSHION_WIDTH = 2;
export const EDGE_WIDTH = 5; // 5 after cushion

function pocketDimensions(
  corner_angle: number,
  corner_mouth: number,
  corner_shelf: number,
  side_angle: number,
  side_mouth: number,
  side_shelf: number
) {
  const sin_num_1 = Math.sin(((180 - corner_angle) * Math.PI) / 180);
  const sin_den_1 = Math.sin(((corner_angle - 90) * Math.PI) / 180);
  const sin_num_2 = Math.sin(((180 - side_angle) * Math.PI) / 180);
  const sin_den_2 = Math.sin(((side_angle - 90) * Math.PI) / 180);
  const z_1 = corner_mouth / 2 - (corner_shelf * sin_den_1) / sin_num_1;
  const z_2 = side_mouth / 2 - (side_shelf * sin_den_2) / sin_num_2;

  const y = (z_1 * sin_num_1 - z_2 * sin_num_2) / (sin_den_1 - sin_den_2);
  const x = z_1 * sin_num_1 - y * sin_den_1;

  const corner = (y - corner_mouth / 2 - corner_shelf) * Math.SQRT1_2;
  const side = side_shelf + y;

  return { back: x, hole: y, corner, side };
}

export const POCKET_DIMENSIONS = pocketDimensions(
  CORNER_ANGLE - 45,
  CORNER_MOUTH,
  CORNER_SHELF,
  SIDE_ANGLE,
  SIDE_MOUTH,
  SIDE_SHELF
);

// TODO: allow choosing cue length, longer cue should have better precision
export const CUE_LENGTH = 36;

// TODO: these pockets are not in the right positions
export const POCKETS = [
  {
    x: -TABLE_WIDTH / 2 - POCKET_DIMENSIONS.corner,
    y: -TABLE_WIDTH - POCKET_DIMENSIONS.corner,
  },
  {
    x: TABLE_WIDTH / 2 + POCKET_DIMENSIONS.corner,
    y: -TABLE_WIDTH - POCKET_DIMENSIONS.corner,
  },
  { x: -TABLE_WIDTH / 2 - POCKET_DIMENSIONS.side, y: 0 },
  { x: TABLE_WIDTH / 2 + POCKET_DIMENSIONS.side, y: 0 },
  {
    x: -TABLE_WIDTH / 2 - POCKET_DIMENSIONS.corner,
    y: TABLE_WIDTH + POCKET_DIMENSIONS.corner,
  },
  {
    x: TABLE_WIDTH / 2 + POCKET_DIMENSIONS.corner,
    y: TABLE_WIDTH + POCKET_DIMENSIONS.corner,
  },
].map(({ x, y }) => new Vector3(x, y, 0));

type RenderState = {
  position: Vector3;
  rotation: Euler;
};

type BallRenderState = RenderState & {
  color: string;
};

// these velocities are all multiplied by tick rate
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
          ball.y * OFFSET_Y + TABLE_WIDTH / 2 - OFFSET_Y * 2,
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
    this.anchor = {
      position: new Vector3(0, -35, 0),
      rotation: new Euler(),
    };
    this.cue = {
      position: this.anchor.position.clone().add(new Vector3(0, 10, 0)),
      velocity: new Vector3(),
      angular_velocity: new Vector3(),
      angular_position: new Quaternion(),
    };
    this.pressed = "";
  }

  input(mouse: Vector2, pressed: boolean, subticks: number = 1): SyncState {
    const sync = {};

    const cuePosition = () => {
      const tip = new Vector3(mouse.x, mouse.y, 0).sub(this.anchor.position);
      const angle = new Quaternion();
      angle.setFromAxisAngle(new Vector3(0, 0, 1), Math.atan2(tip.x, -tip.y));
      const dist = Math.min(tip.length() - CUE_LENGTH, -BALL_DIAMETER);
      tip.normalize().multiplyScalar(dist).add(this.anchor.position);
      return {
        position: tip,
        rotation: angle,
      };
    };

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
        this.cue.position.copy(cuePosition().position);
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
        // calculate  the tip position, and cue angle at the sime time
        const newCue = cuePosition();
        this.cue.angular_position.copy(newCue.rotation);
        this.anchor.rotation.setFromQuaternion(newCue.rotation);

        // if the next position is close to the anchor than previous, then we've pushing the
        // cue forward, so set a cue velocity, which will be able to collide with the ball
        if (
          this.cue.position.distanceTo(this.anchor.position) <
          newCue.position.distanceTo(this.anchor.position)
        ) {
          this.cue.velocity = newCue.position
            .clone()
            .sub(this.cue.position)
            .multiplyScalar(1 / subticks);

          // if the current mouse position is too close to the anchor, release the cue
          // so we don't spin the cue when the mouse passes through the anchor point
          if (mouse.distanceTo(this.anchor.position) < BALL_DIAMETER * 3) {
            this.pressed = "none"; // set to none so nothing else can be pressed until the mouse button is actually released
            this.cue.velocity = new Vector3(0);
          }
        } else {
          this.cue.velocity = new Vector3();
        }

        this.cue.position.copy(newCue.position);
      }
      if (this.pressed === "ball") {
        // TODO: not allow ball to be placed inside other balls
        const inPocket = POCKETS.some(
          (pocket) => mouse.distanceTo(pocket) < BALL_DIAMETER * 1.5
        );
        const colliding = this.balls
          .slice(1)
          .some((ball) => mouse.distanceTo(ball.position) < BALL_DIAMETER);

        if (!inPocket && !colliding) {
          this.balls[0].position.copy({ ...mouse, z: 0 });
        }
      }
      if (this.pressed === "anchor") {
        // move the cue along with the anchor
        this.cue.position.sub(this.anchor.position);
        this.anchor.position.copy({ ...mouse, z: 0 });
        this.cue.position.add(this.anchor.position);
      }

      console.log(this.pressed);
    }

    if (!pressed && this.pressed) {
      this.pressed = "";
      // set cue velocity to 0 on release
      this.cue.velocity = new Vector3(0);
    }

    return sync;
  }

  update(): SyncState {
    const sync = {};
    // calculate new position
    const positions = this.balls.map((ball) => {
      return ball.position.clone().add(ball.velocity);
    });

    // sinks
    for (let i = 0; i < this.balls.length; ++i) {
      if (
        POCKETS.every(
          (pocket) => positions[i].distanceTo(pocket) > BALL_DIAMETER * 1.5
        )
      ) {
        continue;
      }
      // ball sunk
      this.balls[i].velocity = new Vector3();
      if (this.balls[i].color === "white") {
        positions[i] = new Vector3(0, -TABLE_WIDTH - BALL_DIAMETER * 3, 0);
      } else if (this.balls[i].color === "black") {
        // you lose, (or win if its the last ball)
      } else {
        const color = this.balls[i].color;
        // count number of balls sunk
        const tableSide =
          (TABLE_WIDTH / 2 + BALL_DIAMETER * 3) * (color === "yellow" ? -1 : 1);
        const count = this.balls.filter(
          (ball) => ball.color === color && ball.position.x === tableSide
        ).length;
        positions[i] = new Vector3(
          tableSide,
          (BALL_DIAMETER * 3 - BALL_DIAMETER * count) * 1.2,
          0
        );
      }
    }

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
          // TODO: collision energy loss (as sound in real life)

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

    // collision with the walls
    // TODO: more complex wall collision
    for (let i = 0; i < this.balls.length; ++i) {
      if (positions[i].x < -TABLE_WIDTH / 2 + BALL_DIAMETER / 2) {
        if (velocities[i].x < 0) {
          velocities[i].x *= -1;
        }
      } else if (positions[i].x > TABLE_WIDTH / 2 - BALL_DIAMETER / 2) {
        if (velocities[i].x > 0) {
          velocities[i].x *= -1;
        }
      }

      if (positions[i].y < -TABLE_WIDTH + BALL_DIAMETER / 2) {
        if (velocities[i].y < 0) {
          velocities[i].y *= -1;
        }
      } else if (positions[i].y > TABLE_WIDTH - BALL_DIAMETER / 2) {
        if (velocities[i].y > 0) {
          velocities[i].y *= -1;
        }
      }
    }

    // cue collision
    // TODO: this collision should be sweeping because input is not subticked
    if (
      this.cue.velocity.lengthSq() != 0 &&
      velocities[0].lengthSq() == 0 &&
      this.cue.position.distanceTo(positions[0]) < BALL_DIAMETER / 2 + 0.25 // 0.25 is the cue tip width
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
      const friction = velocities[i].lengthSq() < 1e-6 ? 0 : 0.997;
      velocities[i].multiplyScalar(friction);

      this.balls[i].velocity.copy(velocities[i]);
    }

    return sync;
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
