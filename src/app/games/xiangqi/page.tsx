"use client";

import Camera from "@/util/three-camera";
import { Canvas, useLoader } from "@react-three/fiber";
import { Board, Piece } from "./models";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { Vector2, Vector3 } from "three";

export default function Xiangqi() {
  const font = useLoader(FontLoader, "/fonts/ZhiMangXing_Regular.json");

  const pieces0 = [
    { position: new Vector2(1, 9), text: "車" },
    { position: new Vector2(2, 9), text: "馬" },
    { position: new Vector2(3, 9), text: "象" },
    { position: new Vector2(4, 9), text: "士" },
    { position: new Vector2(5, 9), text: "將" },
    { position: new Vector2(6, 9), text: "士" },
    { position: new Vector2(7, 9), text: "象" },
    { position: new Vector2(8, 9), text: "馬" },
    { position: new Vector2(9, 9), text: "車" },
    { position: new Vector2(2, 7), text: "砲" },
    { position: new Vector2(8, 7), text: "砲" },
    { position: new Vector2(1, 6), text: "卒" },
    { position: new Vector2(3, 6), text: "卒" },
    { position: new Vector2(5, 6), text: "卒" },
    { position: new Vector2(7, 6), text: "卒" },
    { position: new Vector2(9, 6), text: "卒" },
  ]
  const pieces1 = [
    { position: new Vector2(1, 0), text: "車" },
    { position: new Vector2(2, 0), text: "馬" },
    { position: new Vector2(3, 0), text: "相" },
    { position: new Vector2(4, 0), text: "仕" },
    { position: new Vector2(5, 0), text: "帥" },
    { position: new Vector2(5, 0), text: "帅" },
    { position: new Vector2(6, 0), text: "仕" },
    { position: new Vector2(7, 0), text: "相" },
    { position: new Vector2(8, 0), text: "馬" },
    { position: new Vector2(9, 0), text: "車" },
    { position: new Vector2(2, 2), text: "炮" },
    { position: new Vector2(8, 2), text: "炮" },
    { position: new Vector2(1, 3), text: "兵" },
    { position: new Vector2(3, 3), text: "兵" },
    { position: new Vector2(5, 3), text: "兵" },
    { position: new Vector2(7, 3), text: "兵" },
    { position: new Vector2(9, 3), text: "兵" },
  ]
  const river = "楚河 漢界";

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
      >

        <Camera fov={90} position={[0, 0, 12]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={1} />


        <Board />

        {pieces0.map((piece, i) => (
          <Piece key={`r${i}`}
            font={font} 
            position={new Vector3(piece.position.x * 2 - 10, piece.position.y * 2 - 9, 0)}
            text={piece.text}
            color="red"
          />
        ))}
        {pieces1.map((piece, i) => (
          <Piece key={`b${i}`}
            font={font} 
            position={new Vector3(piece.position.x * 2 - 10, piece.position.y * 2 - 9, 0)}
            text={piece.text}
            color="black"
          />
        ))}
      </Canvas>
    </div>
  );
}