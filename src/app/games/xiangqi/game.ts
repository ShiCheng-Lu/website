import { matrix } from "@/util/util";
import { Vector2 } from "three";

export type PieceState = {
  position: Vector2;
  color: string;
  type: "K" | "A" | "E" | "H" | "R" | "C" | "P";
  text: string;
};

export class Game {
  pieces: PieceState[];
  board: (PieceState | undefined)[][];

  constructor() {
    this.pieces = [
      { position: new Vector2(1, 9), type: "R", text: "車", color: "black" },
      { position: new Vector2(2, 9), type: "H", text: "馬", color: "black" },
      { position: new Vector2(3, 9), type: "E", text: "象", color: "black" },
      { position: new Vector2(4, 9), type: "A", text: "士", color: "black" },
      { position: new Vector2(5, 9), type: "K", text: "將", color: "black" },
      { position: new Vector2(6, 9), type: "A", text: "士", color: "black" },
      { position: new Vector2(7, 9), type: "E", text: "象", color: "black" },
      { position: new Vector2(8, 9), type: "H", text: "馬", color: "black" },
      { position: new Vector2(9, 9), type: "R", text: "車", color: "black" },
      { position: new Vector2(2, 7), type: "C", text: "砲", color: "black" },
      { position: new Vector2(8, 7), type: "C", text: "砲", color: "black" },
      { position: new Vector2(1, 6), type: "P", text: "卒", color: "black" },
      { position: new Vector2(3, 6), type: "P", text: "卒", color: "black" },
      { position: new Vector2(5, 6), type: "P", text: "卒", color: "black" },
      { position: new Vector2(7, 6), type: "P", text: "卒", color: "black" },
      { position: new Vector2(9, 6), type: "P", text: "卒", color: "black" },
      { position: new Vector2(1, 0), type: "R", text: "俥", color: "red" },
      { position: new Vector2(2, 0), type: "H", text: "傌", color: "red" },
      { position: new Vector2(3, 0), type: "E", text: "相", color: "red" },
      { position: new Vector2(4, 0), type: "A", text: "仕", color: "red" },
      { position: new Vector2(5, 0), type: "K", text: "帥", color: "red" },
      { position: new Vector2(6, 0), type: "A", text: "仕", color: "red" },
      { position: new Vector2(7, 0), type: "E", text: "相", color: "red" },
      { position: new Vector2(8, 0), type: "H", text: "傌", color: "red" },
      { position: new Vector2(9, 0), type: "R", text: "俥", color: "red" },
      { position: new Vector2(2, 2), type: "C", text: "炮", color: "red" },
      { position: new Vector2(8, 2), type: "C", text: "炮", color: "red" },
      { position: new Vector2(1, 3), type: "P", text: "兵", color: "red" },
      { position: new Vector2(3, 3), type: "P", text: "兵", color: "red" },
      { position: new Vector2(5, 3), type: "P", text: "兵", color: "red" },
      { position: new Vector2(7, 3), type: "P", text: "兵", color: "red" },
      { position: new Vector2(9, 3), type: "P", text: "兵", color: "red" },
    ];
    // slightly larger, only 1 <= x <= 9, 0 <= y <= 9 are used
    // 10 x 10 so that +- 1 exists, so we don't run out of index
    // x = 0, y = -1 index and > 9 index will always be undefined
    this.board = matrix([10, 10], undefined);
    for (const piece of this.pieces) {
      const { x, y } = piece.position;
      this.board[x][y] = piece;
    }
  }

  // moves for each piece, given the current board state
  // assuming could take any piece (including your own)
  // self taking should be checked afterwards, this is to simplify
  // the movement logic
  kMove({ x, y }: Vector2): Vector2[] {
    const allowedMoves = [];
    if (x - 1 >= 4) {
      allowedMoves.push(new Vector2(x - 1, y));
    }
    if (x + 1 <= 6) {
      allowedMoves.push(new Vector2(x + 1, y));
    }
    if (y - 1 >= 7 || y - 1 <= 2) {
      allowedMoves.push(new Vector2(x, y - 1));
    }
    if (y + 1 >= 7 || y + 1 <= 2) {
      allowedMoves.push(new Vector2(x, y + 1));
    }
    // flying general rule, should not be playable but used to check for checks
    for (let ny = y - 1; ny >= 0; --ny) {
      const piece = this.board[x][ny];
      if (piece) {
        if (piece.type === "K") {
          allowedMoves.push(new Vector2(x, ny));
        }
        break;
      }
    }
    for (let ny = y + 1; ny <= 9; ++ny) {
      const piece = this.board[x][ny];
      if (piece) {
        if (piece.type === "K") {
          allowedMoves.push(new Vector2(x, ny));
        }
        break;
      }
    }
    return allowedMoves;
  }

  aMove({ x, y }: Vector2): Vector2[] {
    const allowedMoves = [];
    if (x - 1 >= 4) {
      if (y - 1 >= 7 || y - 1 <= 2) {
        allowedMoves.push(new Vector2(x - 1, y - 1));
      }
      if (y + 1 >= 7 || y + 1 <= 2) {
        allowedMoves.push(new Vector2(x - 1, y + 1));
      }
    }
    if (x + 1 <= 6) {
      if (y - 1 >= 7 || y - 1 <= 2) {
        allowedMoves.push(new Vector2(x + 1, y - 1));
      }
      if (y + 1 >= 7 || y + 1 <= 2) {
        allowedMoves.push(new Vector2(x + 1, y + 1));
      }
    }

    return allowedMoves;
  }

  eMove({ x, y }: Vector2): Vector2[] {
    const allowedMoves = [];
    if (y != 5) {
      if (this.board[x - 1][y - 1] === undefined) {
        allowedMoves.push(new Vector2(x - 2, y - 2));
      }
      if (this.board[x + 1][y - 1] === undefined) {
        allowedMoves.push(new Vector2(x + 2, y - 2));
      }
    }
    if (y != 4) {
      if (this.board[x - 1][y + 1] === undefined) {
        allowedMoves.push(new Vector2(x - 2, y + 2));
      }
      if (this.board[x + 1][y + 1] === undefined) {
        allowedMoves.push(new Vector2(x + 2, y + 2));
      }
    }
    return allowedMoves;
  }

  hMove({ x, y }: Vector2): Vector2[] {
    const allowedMoves = [];
    if (this.board[x][y + 1] === undefined) {
      allowedMoves.push(new Vector2(x - 1, y + 2));
      allowedMoves.push(new Vector2(x + 1, y + 2));
    }
    if (this.board[x][y - 1] === undefined) {
      allowedMoves.push(new Vector2(x - 1, y - 2));
      allowedMoves.push(new Vector2(x + 1, y - 2));
    }
    if (this.board[x - 1][y] === undefined) {
      allowedMoves.push(new Vector2(x - 2, y - 1));
      allowedMoves.push(new Vector2(x - 2, y + 1));
    }
    if (this.board[x + 1][y] === undefined) {
      allowedMoves.push(new Vector2(x + 2, y - 1));
      allowedMoves.push(new Vector2(x + 2, y + 1));
    }
    return allowedMoves;
  }

  rMove({ x, y }: Vector2): Vector2[] {
    const allowedMoves = [];
    for (let nx = x - 1; nx >= 0; --nx) {
      allowedMoves.push(new Vector2(nx, y));
      if (this.board[nx][y]) break;
    }
    for (let nx = x + 1; nx <= 9; ++nx) {
      allowedMoves.push(new Vector2(nx, y));
      if (this.board[nx][y]) break;
    }
    for (let ny = y - 1; ny >= 0; --ny) {
      allowedMoves.push(new Vector2(x, ny));
      if (this.board[x][ny]) break;
    }
    for (let ny = y + 1; ny <= 9; ++ny) {
      allowedMoves.push(new Vector2(x, ny));
      if (this.board[x][ny]) break;
    }
    return allowedMoves;
  }

  cMove({ x, y }: Vector2): Vector2[] {
    const allowedMoves = [];
    let support = false;
    for (let nx = x - 1; nx >= 0; --nx) {
      if (this.board[nx][y]) {
        if (support) {
          allowedMoves.push(new Vector2(nx, y));
          break;
        }
        support = true;
      } else if (!support) {
        allowedMoves.push(new Vector2(nx, y));
      }
    }
    support = false;
    for (let nx = x + 1; nx <= 9; ++nx) {
      if (this.board[nx][y]) {
        if (support) {
          allowedMoves.push(new Vector2(nx, y));
          break;
        }
        support = true;
      } else if (!support) {
        allowedMoves.push(new Vector2(nx, y));
      }
    }
    support = false;
    for (let ny = y - 1; ny >= 0; --ny) {
      if (this.board[x][ny]) {
        if (support) {
          allowedMoves.push(new Vector2(x, ny));
          break;
        }
        support = true;
      } else if (!support) {
        allowedMoves.push(new Vector2(x, ny));
      }
    }
    support = false;
    for (let ny = y + 1; ny <= 9; ++ny) {
      if (this.board[x][ny]) {
        if (support) {
          allowedMoves.push(new Vector2(x, ny));
          break;
        }
        support = true;
      } else if (!support) {
        allowedMoves.push(new Vector2(x, ny));
      }
    }
    return allowedMoves;
  }

  pMove({ x, y }: Vector2, player: number): Vector2[] {
    // added player to pawn moves since they are restricted based on which player controls them, and cannot be differenciated otherwise
    const allowedMoves = [];
    if (player === 0) {
      allowedMoves.push(new Vector2(x, y + 1));
      if (y >= 5) {
        // crossed the river
        allowedMoves.push(new Vector2(x - 1, y));
        allowedMoves.push(new Vector2(x + 1, y));
      }
    } else {
      allowedMoves.push(new Vector2(x, y - 1));
      if (y <= 4) {
        // crossed the river
        allowedMoves.push(new Vector2(x - 1, y));
        allowedMoves.push(new Vector2(x + 1, y));
      }
    }
    return allowedMoves;
  }

  allowedMoves(piece?: PieceState): Vector2[] {
    console.log("calculate allowed moves");
    let allowedMoves: Vector2[] = [];
    switch (piece?.type) {
      case "K":
        allowedMoves = this.kMove(piece.position);
        break;
      case "A":
        allowedMoves = this.aMove(piece.position);
        break;
      case "H":
        allowedMoves = this.hMove(piece.position);
        break;
      case "E":
        allowedMoves = this.eMove(piece.position);
        break;
      case "R":
        allowedMoves = this.rMove(piece.position);
        break;
      case "C":
        allowedMoves = this.cMove(piece.position);
        break;
      case "P":
        allowedMoves = this.pMove(
          piece.position,
          piece.color === "red" ? 0 : 1
        );
        break;
    }
    allowedMoves = allowedMoves.filter((v) => {
      if (v.x < 1 || v.x > 9 || v.y < 0 || v.y > 9) {
        return false; // outside of board
      }
      const isEmpty = this.board[v.x][v.y] === undefined;
      const isCapture = this.board[v.x][v.y]?.color !== piece?.color;
      return isEmpty || isCapture;
    });

    return allowedMoves;
  }

  movePiece(from: Vector2, to: Vector2) {
    const piece = this.board[from.x][from.y];
    const capture = this.board[to.x][to.y];
    if (piece) {
      this.board[to.x][to.y] = piece;
      this.board[from.x][from.y] = undefined;
      piece.position = to.clone();
    }
    if (capture) {
      this.pieces.splice(this.pieces.indexOf(capture), 1);
    }
  }
}
