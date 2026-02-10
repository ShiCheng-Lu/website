import { Vector2 } from "three";


type Piece = {
  position: Vector2;
  color: string;
  type: 'K' | 'A' | 'E' | 'H' | 'R' | 'C' | 'P';
}

class Game {

  pieces0: Piece[];
  pieces1: Piece[];

  constructor() {
    this.pieces0 = [];
    this.pieces1 = [];
  }
}


