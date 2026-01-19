import { Euler, Quaternion, Vector2, Vector3 } from "three";

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
};

export type GameState = {
  balls: BallRenderState[];
  cue: RenderState;
  anchor: RenderState;
};

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
      // ...POOL_STATE.map((ball) => ({
      //   position: new Vector3(
      //     ball.x * OFFSET_X,
      //     ball.y * OFFSET_Y + TABLE_WIDTH / 2 - OFFSET_Y * 2,
      //     0
      //   ),
      //   velocity: new Vector3(),
      //   angular_velocity: new Vector3(),
      //   angular_position: new Quaternion(),
      //   color: ball.color,
      // })),
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

    if (this.turn !== this.player) {
      return sync;
    }




    return sync;
  }
  update(): SyncState {
    const sync = {};

    // do physics


    // if all balls are done, 

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
  receiveSyncState(sync: SyncState) {

  }
}
