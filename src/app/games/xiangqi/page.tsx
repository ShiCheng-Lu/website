"use client";

import Camera from "@/util/three-camera";
import { Canvas } from "@react-three/fiber";
import { Board, Piece } from "./models";
import { Euler, Vector2, Vector3 } from "three";
import { Game, PieceState } from "./game";
import { useMemo, useRef, useState } from "react";
import { GameSession, GameSessionRef } from "@/components/GameSession";
import { isMobile } from "react-device-detect";

type SyncState =
  | { reset: true }
  | {
      reset: false;
      from: Vector2;
      to: Vector2;
    };

export default function Xiangqi() {
  const CAMERA_FOV = 90;
  const CAMERA_HEIGHT = isMobile ? 18 : 12;
  const [game, setGame] = useState(new Game());

  const [hovered, setHovered] = useState<PieceState>();
  const [selected, setSelected] = useState<PieceState>();
  const [position, setPosition] = useState<Vector2>();
  const [checkHighlight, setCheckHighlight] = useState<PieceState[]>([]);
  const [pieces, setPieces] = useState<PieceState[]>(game.pieces);
  const session = useRef(new GameSessionRef());

  const getSquare = (e: React.PointerEvent<HTMLDivElement>): Vector2 | null => {
    // project onto the plane of the piece text to see where it's hovered
    const scale =
      ((Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_HEIGHT) /
        window.innerHeight) *
      (game.player ? -1 : 1);
    const y = (window.innerHeight - e.clientY * 2) * scale;
    const x = (e.clientX * 2 - window.innerWidth) * scale;

    // get hovered piece
    const position = new Vector2((x + 10) / 2, (y + 9) / 2);
    const intPosition = position.clone().round();

    if (
      intPosition.x >= 1 &&
      intPosition.x <= 9 &&
      intPosition.y >= 0 &&
      intPosition.y <= 9 &&
      position.sub(intPosition).length() < (isMobile ? 1 : 0.8) / 2
    ) {
      return intPosition;
    } else {
      return null;
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // project onto the plane of the piece text to see where it's hovered
    const square = getSquare(e);
    if (square) {
      const piece = game.pieces.find((p) => p.position.equals(square));
      setHovered(piece);
    } else {
      setHovered(undefined);
    }
  };

  const allowedMoves = useMemo(() => game.allowedMoves(selected), [selected]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const square = getSquare(e);

    if (selected && square) {
      if (session.current.connected && game.turn != game.player) {
        setSelected(undefined);
        return;
      }
      if (allowedMoves.some((p) => p.equals(square))) {
        if (session.current.connected) {
          session.current.send({
            from: selected.position.clone(),
            to: square.clone(),
          });
        }
        game.movePiece(selected.position, square);

        const color = game.turn ? "black" : "red";
        setCheckHighlight(game.inCheck(color));
        setPieces([...game.pieces]);
        setSelected(undefined);
        return;
      }
    }
    if (square) {
      const piece = game.pieces.find((p) => p.position.equals(square));
      if (piece !== selected) {
        setSelected(piece);
        return;
      }
    }
    setSelected(undefined);
  };

  const reset = (send: boolean) => {
    const newGame = new Game();
    newGame.player = 1 - game.player;
    setGame(newGame);
    if (send) {
      session.current.send({
        reset: true,
      });
    }
    setPieces([...newGame.pieces]);
  };

  session.current.receive = (sync: SyncState) => {
    if (sync.reset) {
      console.log("reset request");
      reset(false);
    } else {
      console.log(`move sync`, sync);
      game.movePiece(
        new Vector2(sync.from.x, sync.from.y),
        new Vector2(sync.to.x, sync.to.y)
      );

      const color = game.turn ? "black" : "red";
      setCheckHighlight(game.inCheck(color));
      setPieces([...game.pieces]);
    }
  };

  session.current.reset = () => reset(true);

  session.current.connect = (host: boolean) => {
    const newGame = new Game();
    newGame.player = host ? 0 : 1;
    setGame(newGame);
    setPieces([...newGame.pieces]);
  };

  const canMovePiece =
    selected?.color === (game.turn ? "black" : "red") &&
    (session.current.connected ? game.turn === game.player : true);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        userSelect: "none",
      }}
      onScroll={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Canvas
        shadows
        style={{ flex: 1, touchAction: "none", background: "gray" }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
      >
        <Camera
          fov={CAMERA_FOV}
          position={[0, 0, CAMERA_HEIGHT]}
          rotation={[0, 0, game.player ? Math.PI : 0]}
        />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={1} />

        <Board />

        {pieces.map((piece, i) => (
          <Piece
            key={`p${i}`}
            position={
              new Vector3(
                piece.position.x * 2 - 10,
                piece.position.y * 2 - 9,
                0
              )
            }
            rotation={new Euler(0, 0, game.player ? Math.PI : 0)}
            text={piece.text}
            color={
              (isMobile ? selected : hovered) === piece
                ? "lightgreen"
                : "lightgray"
            }
            textColor={piece.color}
          />
        ))}

        {/* <mesh position={[xy[0], xy[1], 0.3]}>
          <circleGeometry args={[0.1, 32]} />
          <meshBasicMaterial color={"pink"} />
        </mesh> */}
        {allowedMoves.map((position, i) => (
          <mesh
            key={`allowed-moves-${i}`}
            position={
              new Vector3(
                position.x * 2 - 10,
                position.y * 2 - 9,
                game.board[position.x][position.y] ? 0.3 : 0
              )
            }
          >
            <ringGeometry args={[canMovePiece ? 0 : 0.3, 0.4, 32]} />
            <meshStandardMaterial color="green" opacity={0.7} transparent />
          </mesh>
        ))}

        {checkHighlight.map((piece, i) => (
          <mesh
            key={`check-highlights-${i}`}
            position={
              new Vector3(
                piece.position.x * 2 - 10,
                piece.position.y * 2 - 9,
                0
              )
            }
          >
            <circleGeometry args={[1, 32]} />
            <meshStandardMaterial color={"red"} opacity={0.5} transparent />
          </mesh>
        ))}
      </Canvas>

      <GameSession game="XiangQi" ref={session} />
    </div>
  );
}
