"use client";

import Camera from "@/util/three-camera";
import { Canvas, useLoader } from "@react-three/fiber";
import { Board, Piece } from "./models";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { Vector2, Vector3 } from "three";
import { Game, PieceState } from "./game";
import { useMemo, useState } from "react";

export default function Xiangqi() {
  const font = useLoader(FontLoader, "/fonts/HanWangShinSuMedium_Regular.json");

  const CAMERA_FOV = 90;
  const CAMERA_HEIGHT = 12;
  const game = useMemo(() => new Game(), []);

  const [hovered, setHovered] = useState<PieceState>();
  const [selected, setSelected] = useState<PieceState>();
  const [position, setPosition] = useState<Vector2>();

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // project onto the plane of the piece text to see where it's hovered
    const scale =
      (Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_HEIGHT) /
      window.innerHeight;
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
      position.sub(intPosition).length() < 0.7 / 2
    ) {
      const piece = game.pieces.find((p) => p.position.equals(intPosition));
      setHovered(piece);
    } else {
      setHovered(undefined);
    }
    setPosition(intPosition);
  };

  const allowedMoves = useMemo(() => game.allowedMoves(selected), [selected]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selected && position) {
      if (allowedMoves.some((p) => p.equals(position))) {
        game.movePiece(selected.position, position);
        setSelected(undefined);
        setHovered(undefined);
        return;
      }
    }

    if (!hovered) {
      setSelected(undefined);
      return;
    }

    setSelected(hovered);
  };

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
        <Camera fov={CAMERA_FOV} position={[0, 0, CAMERA_HEIGHT]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={1} />

        <Board font={font} />

        {game.pieces.map((piece, i) => (
          <Piece
            key={`p${i}`}
            font={font}
            position={
              new Vector3(
                piece.position.x * 2 - 10,
                piece.position.y * 2 - 9,
                0
              )
            }
            text={piece.text}
            color={hovered === piece ? "lightgreen" : "lightgray"}
            textColor={piece.color}
          />
        ))}

        {/* <mesh position={[xy[0], xy[1], 0.3]}>
          <circleGeometry args={[0.1, 32]} />
          <meshBasicMaterial color={"pink"} />
        </mesh> */}
        {allowedMoves.map((position, i) => (
          <mesh
            key={i}
            position={
              new Vector3(
                position.x * 2 - 10,
                position.y * 2 - 9,
                game.board[position.x][position.y] ? 0.3 : 0
              )
            }
          >
            <circleGeometry args={[0.4, 32]} />
            <meshStandardMaterial color="green" />
          </mesh>
        ))}
      </Canvas>
    </div>
  );
}
