import { matrix } from "@/util/util";
import { Vector2 } from "three";

export type PieceState = {
  position: Vector2;
  color: string;
  type: "K" | "A" | "E" | "H" | "R" | "C" | "P";
  text: string;
};

const playerColor = ["red", "black"];

export class Game {
  pieces: PieceState[] = [
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
  board: (PieceState | undefined)[][] = matrix([11, 11], undefined);
  turn: number = 0;
  player: number = 0;

  constructor() {
    for (const piece of this.pieces) {
      const { x, y } = piece.position;
      this.board[x][y] = piece;
    }
  }

  // return the function to check if piece of `color` can be moved to `position`
  // without check for checks/mates
  checkMovementValidity(color: string) {
    return ({ x, y }: Vector2) => {
      if (x < 1 || x > 9 || y < 0 || y > 9) {
        return false; // outside of board
      }
      const isEmpty = this.board[x][y] === undefined;
      const isCapture = this.board[x][y]?.color !== color;
      return isEmpty || isCapture;
    };
  }

  // moves for each piece, given the current board state
  // assuming could take any piece (including your own)
  // self taking should be checked afterwards, this is to simplify
  // the movement logic
  kMove({ position: { x, y }, color }: PieceState): Vector2[] {
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
    return allowedMoves.filter(this.checkMovementValidity(color));
  }

  aMove({ position: { x, y }, color }: PieceState): Vector2[] {
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

    return allowedMoves.filter(this.checkMovementValidity(color));
  }

  eMove({ position: { x, y }, color }: PieceState): Vector2[] {
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
    return allowedMoves.filter(this.checkMovementValidity(color));
  }

  hMove({ position: { x, y }, color }: PieceState): Vector2[] {
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
    return allowedMoves.filter(this.checkMovementValidity(color));
  }

  rMove({ position: { x, y }, color }: PieceState): Vector2[] {
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
    return allowedMoves.filter(this.checkMovementValidity(color));
  }

  cMove({ position: { x, y }, color }: PieceState): Vector2[] {
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
    return allowedMoves.filter(this.checkMovementValidity(color));
  }

  pMove({ position: { x, y }, color }: PieceState): Vector2[] {
    // added player to pawn moves since they are restricted based on which player controls them, and cannot be differenciated otherwise
    const allowedMoves = [];
    if (color === "red") {
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
    return allowedMoves.filter(this.checkMovementValidity(color));
  }

  validMovements(piece: PieceState): Vector2[] {
    let allowedMoves: Vector2[] = [];
    switch (piece.type) {
      case "K":
        allowedMoves = this.kMove(piece);
        break;
      case "A":
        allowedMoves = this.aMove(piece);
        break;
      case "H":
        allowedMoves = this.hMove(piece);
        break;
      case "E":
        allowedMoves = this.eMove(piece);
        break;
      case "R":
        allowedMoves = this.rMove(piece);
        break;
      case "C":
        allowedMoves = this.cMove(piece);
        break;
      case "P":
        allowedMoves = this.pMove(piece);
        break;
    }
    return allowedMoves;
  }

  allowedMoves(piece?: PieceState): Vector2[] {
    if (!piece) return [];
    const validMovements = this.validMovements(piece);
    const color = piece.color;
    const currentBoard = this.board;
    const legalMoves = validMovements.filter(({ x, y }) => {
      // check legality, does not move into check
      const newBoard = matrix([11, 11], undefined);
      for (const piece of this.pieces) {
        const { x, y } = piece.position;
        newBoard[x][y] = piece;
      }
      newBoard[piece.position.x][piece.position.y] = 0;
      newBoard[x][y] = piece;
      const king = this.pieces.find(
        (p) => p.type === "K" && p.color === color && p !== piece
      );
      const kingPosition = king?.position ?? new Vector2(x, y);

      this.board = newBoard;
      for (const opponentPiece of this.pieces) {
        if (opponentPiece.color === piece.color) continue;
        const { x, y } = opponentPiece.position;
        if (newBoard[x][y] !== opponentPiece) continue;
        // check a opponent piece cannot take our king after this move
        const oppoenentMoves = this.validMovements(opponentPiece);
        if (oppoenentMoves.some((square) => square.equals(kingPosition))) {
          return false;
        }
      }
      return true;
    });
    this.board = currentBoard;
    return legalMoves;
  }

  // return a list of pieces that puts your king in check
  inCheck(color: string): PieceState[] {
    const king = this.pieces.find((p) => p.type === "K" && p.color === color);
    const kingPosition = king?.position ?? new Vector2(NaN);

    const checks = this.pieces.filter((piece) => {
      if (piece.color === color) return false;
      const moves = this.validMovements(piece);
      return moves.some((square) => square.equals(kingPosition));
    })
    return checks;
  }

  movePiece(from: Vector2, to: Vector2) {
    const piece = this.board[from.x][from.y];
    if (playerColor[this.turn] !== piece?.color) {
      return;
    }
    const capture = this.board[to.x][to.y];
    if (piece) {
      this.board[to.x][to.y] = piece;
      this.board[from.x][from.y] = undefined;
      piece.position = to.clone();
    }
    if (capture) {
      this.pieces.splice(this.pieces.indexOf(capture), 1);
    }
    this.turn = 1 - this.turn;
  }
}
