import { Vector2, Vector3 } from "three"


export type SyncState = {
  ball?: Vector3;
  direction?: Vector3; // also power
}

export type GameState = {
  balls: {
    position: Vector3;
    color: string;
  }[];
};

const POOL_STATE = [
  // { x: , y: , color: 'yellow' },
];

export default class PoolGame {

  balls: GameState["balls"];
  player: number;
  turn: number;

  constructor() {
    this.balls = [];
    this.player = 0;
    this.turn = 0;
  }

  update(mouse: Vector2): SyncState {
    const sync = {};

    // handle collision with 





    return sync;
  }

  state(): GameState {
    return {
      balls: this.balls.map((ball) => ({
        position: ball.position.clone(),
        color: ball.color,
      }))
    }
  }

  reset() {
    this.player = 0;
    this.turn = 0;
  }
}