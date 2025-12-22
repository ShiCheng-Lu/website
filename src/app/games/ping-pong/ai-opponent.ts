import { GameState } from "./physics";

class AIPingPonger {

  lastState?: GameState;


  update(state: GameState) {
    if (!this.lastState) {
      this.lastState = state;
      return;
    }

    // 

  }
};
