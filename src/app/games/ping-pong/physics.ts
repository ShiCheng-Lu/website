import { Vector2, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils.js";
import { log2 } from "three/tsl";

const PADDLE_OFFSET = 0.0656168;

export type SyncState = {
  paddle?: Vector2;
  ball?: Vector3;
  target?: Vector3;
  score?: [number, number];
};

export type GameState = {
  paddle0: Vector3;
  paddle1: Vector3;
  score0: number;
  score1: number;
  ball: Vector3;
};

export default class PingPongGame {
  ball: Vector3;
  paddle0: Vector3;
  paddle1: Vector3;
  score0: number;
  score1: number;
  player: number;
  turn: number;

  // set if the ball is ok, returns new ball position or null is a score should be counted
  ballDynamics: (t: number) => Vector3 | null;
  time: number;

  constructor() {
    this.ball = new Vector3(0, -3.5, 0.3);
    this.paddle0 = new Vector3(NaN);
    this.paddle1 = new Vector3(NaN);
    this.score0 = 0;
    this.score1 = 0;
    this.player = 0;
    this.turn = 0;
    this.time = 0;

    this.ballDynamics = () => {
      return new Vector3(0, -3.5, 0.3);
    };
  }

  reset() {
    this.ball = new Vector3(0, -3.5, 0.3);
    this.score0 = 0;
    this.score1 = 0;
    this.turn = 0;
    this.time = 0;

    this.ballDynamics = () => {
      return new Vector3(0, -3.5, 0.3);
    };
  }

  update(mouse: Vector2): SyncState {
    const sync: SyncState = {};
    // update ball
    const newBall = this.ballDynamics(this.time);
    this.time += 1;

    // update paddle location
    const newPaddle = new Vector2(
      Math.min(Math.max(mouse.x, -5), 5) * (this.player ? -1 : 1),
      Math.min(mouse.y, -0.3) * (this.player ? -1 : 1)
    );

    // compute collision if its my turn to hit the ball
    if (newBall && this.turn == this.player) {
      // this.turn = 1 - this.player;
      const paddle = this.player ? this.paddle1 : this.paddle0;
      const start = paddle.clone().sub(this.ball);
      const end = newPaddle.clone().sub(newBall);

      // paddle crossed vertically and in the right direction
      if (start.y > 0 != end.y > 0 && start.y > end.y == Boolean(this.player)) {
        // paddle crossed vertically
        // interpolate the paddle position at y=0
        const a = start.x * (start.y / (start.y - end.y));
        const b = end.x * (end.y / (end.y - start.y));
        const x = a + b;

        // within width of the paddle
        if (Math.abs(x) - 0.25 < 0) {
          console.log(paddle);
          const ballVel = newBall.clone().sub(this.ball);
          const paddleVel = newPaddle.clone().sub(paddle);
          const target = new Vector3(
            clamp(paddleVel.x * 10 + ballVel.x * 20, -2, 2),
            clamp(paddleVel.y * 10 - ballVel.y * 10, -3.5, 3.5),
            0.3
          );
          this.hitBall(newBall.clone(), target);
          sync.ball = newBall;
          sync.target = target;

          console.log(paddle, newPaddle);
        }
      }
    }

    // set new paddle location
    if (!newPaddle.equals(this.player ? this.paddle1 : this.paddle0)) {
      sync.paddle = newPaddle.clone();
    }
    const paddleZ = (newBall ? newBall.z : this.ball.z) + PADDLE_OFFSET;
    if (this.player) {
      this.paddle1 = new Vector3(newPaddle.x, newPaddle.y, paddleZ);
      this.paddle0.z = paddleZ;
    } else {
      this.paddle0 = new Vector3(newPaddle.x, newPaddle.y, paddleZ);
      this.paddle1.z = paddleZ;
    }

    // set new ball position
    if (newBall) {
      this.ball = newBall;
    } else if (Number.isNaN(this.paddle0.x) || Number.isNaN(this.paddle1.x)) {
      // player haven't joined
      this.ballDynamics = () => {
        return new Vector3(0, -3.5, 0.3);
      };
      this.turn = this.player;
    } else if (this.turn == this.player) {
      // was scored on, set state and notify the other player
      if (this.player) {
        this.score0 += 1;
      } else {
        this.score1 += 1;
      }
      sync.score = [this.score0, this.score1];
      this.turn = Math.floor((this.score0 + this.score1) / 2) % 2;
      const newBall = this.turn
        ? new Vector3(0, 3.5, 0.3)
        : new Vector3(0, -3.5, 0.3);
      this.ballDynamics = () => {
        return newBall;
      };
      console.log(sync.score);
    } // if we scored on our screen, the maybe we scored, maybe the other player did catch the ball, we wait for sync state

    return sync;
  }

  receiveSyncState(sync: SyncState) {
    if (sync.ball && sync.target) {
      const position = new Vector3().copy(sync.ball);
      const target = new Vector3().copy(sync.target);
      this.hitBall(position, target);
      this.turn = this.player;
    }
    if (sync.paddle) {
      const paddle = new Vector3(sync.paddle.x, sync.paddle.y, this.ball.z);
      if (this.player) {
        this.paddle0 = paddle;
      } else {
        this.paddle1 = paddle;
      }
    }
    if (sync.score) {
      this.score0 = sync.score[0];
      this.score1 = sync.score[1];
      this.turn = Math.floor((this.score0 + this.score1) / 2) % 2;
      const newBall = this.turn
        ? new Vector3(0, 3.5, 0.3)
        : new Vector3(0, -3.5, 0.3);
      this.ballDynamics = () => {
        return newBall;
      };
      console.log(sync.score);
    }
  }

  hitBall(position: Vector3, target: Vector3) {
    this.turn = 1 - this.turn;

    // if the ball travels from 0 to 1, where 1 is the target
    // where would the net intersect this path?
    // this will determine the initial angle and velocity to get the ball over the net
    // to the target location
    position.y -= 0.0656168;
    const cross = position.y / (position.y - target.y);

    // models as a projectile with decreasing x velocity (air resistance)
    // and parabolic z (height) trajectory (no air resistence)
    // this is for simplicity do that each axis is independent while still
    // maintaining some of the air resistance realism

    // z: f(x) = (1 - c) g(x)^2 + c g(x) +  1
    // g(x) = (k^x - 1) / (k - 1); with k = 2
    const gx = 2 ** cross - 1;
    // find the curve of the ball, which must clear the net
    // net / position.z = -gx^2 + c(gx - gx^2) + 1
    // net / position.z - 1 = gx^2 + c(gx^2 - gx)
    // (net / position.z - 1 - gx^2) / (gx^2 - gx) = c
    const c = (1 / position.z - 1 + gx * gx) / (gx - gx * gx);

    // the second bounce is modeled by the equation
    // z: f(x) = -i (g(x)^2 - (j + 1)g(x) + j)
    // where j = 1.8 to approximate a 75% height/energy retention
    // and i is chosen so that the bounce is elastic
    // angle in = angle out
    const j = 1.8; // time of second bounce
    const i = (2 + c) / (j - 1);

    const scale = position.z;
    const pos = new Vector2(position.x, position.y);
    const tar = new Vector2(target.x, target.y);
    this.ballDynamics = (t: number) => {
      // lets take 1 seconds to get to target
      t /= 60;
      if (t < 1) {
        const dx = Math.log2(t + 1);
        const z = scale * ((-1 - c) * t * t + c * t + 1);

        const a = pos.clone().multiplyScalar(1 - dx);
        const b = tar.clone().multiplyScalar(dx);
        return new Vector3(a.x + b.x, a.y + b.y, z + 0.0656168);
      }

      // second bounce takes j seconds
      if (t < j) {
        const dx = Math.log2(t + 1);
        const z = scale * -i * (t * t - (j + 1) * t + j);

        const a = pos.clone().multiplyScalar(1 - dx);
        const b = tar.clone().multiplyScalar(dx);
        return new Vector3(a.x + b.x, a.y + b.y, z + 0.0656168);
      }

      return null;
    };

    this.time = 0;
  }

  state(): GameState {
    return {
      ball: this.ball.clone(),
      paddle0: this.paddle0.clone(),
      paddle1: this.paddle1.clone(),
      score0: this.score0,
      score1: this.score1,
    };
  }
}
