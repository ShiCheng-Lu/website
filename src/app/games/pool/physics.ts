import { intersection } from "@/util/util";
import { Euler, Quaternion, Vector2, Vector3 } from "three";

export const BALL_DIAMETER = 2.25;
export const BALL_RADIUS = BALL_DIAMETER / 2;
export const TABLE_WIDTH = 50;
export const CORNER_ANGLE = 142; // 142 +- 1
export const CORNER_MOUTH = 4.5; // 4.5 - 4.625
export const CORNER_SHELF = 1; // 1 - 2.25
export const SIDE_ANGLE = 104; // 104 +- 1
export const SIDE_MOUTH = CORNER_MOUTH + 0.5;
export const SIDE_SHELF = 0; // 0 - 0.375
export const CUSHION_WIDTH = 2;
export const CUSHION_HEIGHT = BALL_DIAMETER * 0.635;
export const EDGE_WIDTH = 5; // 5 after cushion

export function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function pocketDimensions(
  corner_angle: number,
  corner_mouth: number,
  corner_shelf: number,
  side_angle: number,
  side_mouth: number,
  side_shelf: number
) {
  const sin_num_1 = Math.sin(radians(180 - corner_angle));
  const sin_den_1 = Math.sin(radians(corner_angle - 90));
  const sin_num_2 = Math.sin(radians(180 - side_angle));
  const sin_den_2 = Math.sin(radians(side_angle - 90));
  const z_1 = corner_mouth / 2 - (corner_shelf * sin_den_1) / sin_num_1;
  const z_2 = side_mouth / 2 - (side_shelf * sin_den_2) / sin_num_2;

  const y = (z_1 * sin_num_1 - z_2 * sin_num_2) / (sin_den_1 - sin_den_2);
  const x = z_1 * sin_num_1 - y * sin_den_1;

  const corner = (y - corner_mouth / 2 + corner_shelf) * Math.SQRT1_2;
  const side = side_shelf + y;

  // back is the radius of the pocket's rim
  // hole is the radius of the pocket's bottom
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
  cue?: RenderState;
  anchor?: RenderState;
  balls?: BallPhysicsState[];
  target?: string;
  turn?: number;
  freeBall?: boolean;
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
  stationary: boolean;
  firstHit: Set<string>;
  target: Set<string>;
  pocketed: Set<string>;
  freeBall: boolean;
  turnTaken: boolean;

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
    this.stationary = true;
    this.firstHit = new Set();
    // target = ["red", "yellow"] on start of game, before ball claims
    // target = ["red"] if player has claimed balls
    // target = ["black"] on last ball
    this.target = new Set(["red", "yellow"]);
    this.pocketed = new Set();
    this.freeBall = false;
    this.turnTaken = false;

    // TODO: add rule so that if the break sinks balls, it's not a claim
  }
  // reset, does exactly what constructor do
  reset() {
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
    this.stationary = true;
    this.firstHit = new Set();
    // target = ["red", "yellow"] on start of game, before ball claims
    // target = ["red"] if player has claimed balls
    // target = ["black"] on last ball
    this.target = new Set(["red", "yellow"]);
    this.pocketed = new Set();
    this.freeBall = false;
  }

  input(mouse: Vector2, pressed: boolean, subticks: number = 1): SyncState {
    const sync: SyncState = {};

    const cuePosition = () => {
      const tip = new Vector3(mouse.x, mouse.y, 0).sub(this.anchor.position);
      const angle = new Quaternion();
      angle.setFromAxisAngle(new Vector3(0, 0, 1), Math.atan2(tip.x, -tip.y));
      const dist = Math.min(
        Math.max(CUE_LENGTH - tip.length(), BALL_DIAMETER),
        CUE_LENGTH - BALL_DIAMETER * 3
      );
      // tip is reversed (from mouse to anchor, so this dist needs to be negative)
      tip.normalize().multiplyScalar(-dist).add(this.anchor.position);
      return {
        position: tip,
        rotation: angle,
      };
    };

    // check for game state
    const stationary = this.balls.every((ball) => !ball.velocity.lengthSq());
    if (this.turn === this.player && this.turnTaken) {
      if (stationary && !this.stationary) {
        this.turnTaken = false;

        // hit is legal if the first hit is the target
        const legal =
          intersection(this.firstHit, this.target).size > 0 ||
          this.pocketed.has("white");
        // keep the turn if it's a legal hit and we sunk a ball
        const sunk = intersection(this.pocketed, this.target).size > 0;

        // black was sunk, win or lose
        if (this.pocketed.has("black")) {
          if (legal && this.target.has("black")) {
            console.log("you win");
          } else {
            console.log("you lost");
          }
        } else if (legal && sunk) {
          // continue turn if the hit is legal and we've sunk a target
          if (this.target.size > 1) {
            // claim ball
            if (this.pocketed.has("yellow")) {
              this.target.clear();
              this.target.add("yellow");
              console.log("claimed yellow");
              // let opponent know of their target
              sync.target = "red";
            } else if (this.pocketed.has("red")) {
              this.target.clear();
              this.target.add("red");
              console.log("claimed red");
              // let opponent know of their target
              sync.target = "yellow";
            }
          }
          // check if all of my targets are sunk
          // sunk balls are placed outside the table area
          const target = this.target.values().next().value;
          const allSunk = this.balls.every((ball) => {
            ball.color !== target ||
              ball.position.x > TABLE_WIDTH / 2 + BALL_DIAMETER ||
              ball.position.x < -TABLE_WIDTH / 2 - BALL_DIAMETER;
          });
          // move on to the black
          if (allSunk) {
            this.target.clear();
            this.target.add("black");
          }
          console.log("continue");
        } else {
          // give opponent the turn if we fucked up
          console.log("give turn");
          this.turn = 1 - this.turn;
          sync.turn = this.turn;

          if (!legal) {
            console.log("free ball");
            sync.freeBall = true;
          }
        }

        this.firstHit.clear();
        this.pocketed.clear();
      }
    }

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
      } else if (
        mouse.distanceTo(this.balls[0].position) < BALL_DIAMETER / 2 &&
        this.freeBall
      ) {
        // trying to pick up the cue ball
        this.pressed = "ball";
      }
    }

    if (pressed && this.pressed) {
      if (this.pressed === "cue") {
        // calculate  the tip position, and cue angle at the sime time
        const newCue = cuePosition();

        // if the next position is close to the anchor than previous, then we've pushing the
        // cue forward, so set a cue velocity, which will be able to collide with the ball
        const oldDistance = this.cue.position.distanceTo(this.anchor.position);
        const newDistance = newCue.position.distanceTo(this.anchor.position);

        if (oldDistance < newDistance) {
          this.cue.velocity = newCue.position
            .clone()
            .sub(this.cue.position)
            .multiplyScalar(1 / subticks);
        } else {
          this.cue.velocity = new Vector3();
        }

        this.cue.position.copy(newCue.position);
        this.cue.angular_position.copy(newCue.rotation);
        this.anchor.rotation.setFromQuaternion(newCue.rotation);

        // cue collision
        // TODO: this collision should be sweeping because input is not subticked
        if (
          this.turn === this.player &&
          !this.turnTaken &&
          this.cue.velocity.lengthSq() != 0 &&
          this.balls[0].velocity.lengthSq() == 0 &&
          this.cue.position.distanceTo(this.balls[0].position) <
            BALL_DIAMETER / 2 + 0.25 // 0.25 is the cue tip width
        ) {
          // TODO: collide with cue position to add spin
          this.balls[0].velocity.add(this.cue.velocity.clone());
          sync.balls = [this.balls[0]]; // only send the state of the cue ball

          // once we hit, freeBall can no longer move it.
          this.freeBall = false;
          this.turnTaken = true;
        }
        // TODO: cue render
        // sync.cue = {
        //   position: this.cue.position.clone(),
        //   rotation: new Euler().setFromQuaternion(this.cue.angular_position),
        // };
      }
      if (this.pressed === "ball") {
        const inPocket = POCKETS.some(
          (pocket) => mouse.distanceTo(pocket) < POCKET_DIMENSIONS.hole
        );
        const colliding = this.balls
          .slice(1)
          .some((ball) => mouse.distanceTo(ball.position) < BALL_DIAMETER);

        if (!inPocket && !colliding) {
          this.balls[0].position.copy({ ...mouse, z: 0 });
          sync.balls = [this.balls[0]]; // send the state of the ball when we move it
        }
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
      // set cue velocity to 0 on release
      this.cue.velocity = new Vector3(0);
    }

    this.stationary = stationary;

    return sync;
  }

  // receive sync state
  sync(sync: SyncState) {
    console.log(sync);
    if (sync.balls !== undefined) {
      for (let i = 0; i < sync.balls.length; ++i) {
        const ball = sync.balls[i];
        this.balls[i].position.copy(ball.position);
        this.balls[i].velocity.copy(ball.velocity);
        this.balls[i].angular_position.copy(ball.angular_position);
        this.balls[i].angular_velocity.copy(ball.angular_velocity);
      }
    }
    if (sync.turn !== undefined) {
      this.turn = sync.turn;
    }
    if (sync.freeBall !== undefined) {
      this.freeBall = sync.freeBall;
    }
    if (sync.target !== undefined) {
      this.target.clear();
      this.target.add(sync.target);
    }
  }

  update() {
    // calculate new position
    const positions = this.balls.map((ball) => {
      return ball.position.clone().add(ball.velocity);
    });

    // pockets
    for (let i = 0; i < this.balls.length; ++i) {
      if (
        POCKETS.every(
          (pocket) => positions[i].distanceTo(pocket) > POCKET_DIMENSIONS.hole
        ) &&
        // temp, since we don't have pocket corner collision, it's possible to hit ball outside, we'll count those as sunks
        positions[i].x > -TABLE_WIDTH / 2 - BALL_DIAMETER &&
        positions[i].x < TABLE_WIDTH / 2 + BALL_DIAMETER &&
        positions[i].y > -TABLE_WIDTH - BALL_DIAMETER &&
        positions[i].y < TABLE_WIDTH + BALL_DIAMETER
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
      this.pocketed.add(this.balls[i].color);
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
    const firstHit = this.firstHit.size === 0;
    for (let i = 1; i < this.balls.length; ++i) {
      for (let j = i + 1; j < this.balls.length; ++j) {
        // collision between balls[i] and balls[j]
        if (positions[i].distanceTo(positions[j]) < BALL_DIAMETER) {
          overlaps[i][j] = true;
          overlaps[j][i] = true;
        }
      }

      // cue overlaps, needs to check for first hit, so this is outside
      if (positions[0].distanceTo(positions[i]) < BALL_DIAMETER) {
        overlaps[0][i] = true;
        overlaps[i][0] = true;

        if (firstHit) {
          this.firstHit.add(this.balls[i].color);
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
    // TODO: more complex wall collision (colliding against pocket side)
    for (let i = 0; i < this.balls.length; ++i) {
      const p = positions[i];
      const v = velocities[i];
      if (
        p.y > TABLE_WIDTH - BALL_RADIUS &&
        p.x > -TABLE_WIDTH / 2 + CORNER_MOUTH * Math.SQRT1_2 &&
        p.x < TABLE_WIDTH / 2 - CORNER_MOUTH * Math.SQRT1_2 &&
        v.y > 0
      ) {
        velocities[i].y = -v.y;
      } else if (
        p.y < -TABLE_WIDTH + BALL_RADIUS &&
        p.x > -TABLE_WIDTH / 2 + CORNER_MOUTH * Math.SQRT1_2 &&
        p.x < TABLE_WIDTH / 2 - CORNER_MOUTH * Math.SQRT1_2 &&
        v.y < 0
      ) {
        velocities[i].y = -v.y;
      } else if (
        p.x < -TABLE_WIDTH / 2 + BALL_RADIUS &&
        p.y > SIDE_MOUTH / 2 &&
        p.y < TABLE_WIDTH - CORNER_MOUTH * Math.SQRT1_2 &&
        v.x < 0
      ) {
        velocities[i].x = -v.x;
      } else if (
        p.x < -TABLE_WIDTH / 2 + BALL_RADIUS &&
        Math.abs(p.y) > SIDE_MOUTH / 2 &&
        Math.abs(p.y) < TABLE_WIDTH - CORNER_MOUTH * Math.SQRT1_2 &&
        v.x < 0
      ) {
        velocities[i].x = -v.x;
      } else if (
        p.x > TABLE_WIDTH / 2 - BALL_RADIUS &&
        Math.abs(p.y) > SIDE_MOUTH / 2 &&
        Math.abs(p.y) < TABLE_WIDTH - CORNER_MOUTH * Math.SQRT1_2 &&
        v.x > 0
      ) {
        velocities[i].x = -v.x;
      }
    }

    // update position
    for (let i = 0; i < this.balls.length; ++i) {
      this.balls[i].position.copy(positions[i]);
    }

    // update velocity
    for (let i = 0; i < this.balls.length; ++i) {
      // if the velocity is already super low, just stop the ball
      const friction = velocities[i].lengthSq() < 1e-6 ? 0 : 0.995;
      velocities[i].multiplyScalar(friction);

      this.balls[i].velocity.copy(velocities[i]);
    }
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
}
