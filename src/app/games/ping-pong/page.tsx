"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { DirectionalLight, OrthographicCamera, Vector2, Vector3 } from "three";
import { Paddle, Table } from "./PingPongModels";
import Camera from "@/util/three-camera";
import {
  connected,
  joinLobby,
  leaveLobby,
  sendData,
  setOnConnection,
  setOnMessage,
  startLobby,
} from "@/util/peer2peer";
import { LobbyData, lobby } from "@/util/database";
import styles from "./page.module.css";
import { onSnapshot, query, where } from "firebase/firestore";
import { user } from "@/util/firebase";
import PingPongGame, { SyncState } from "./physics";
import { GameSession, GameSessionRef } from "@/components/GameSession";

/**
 * Ping pong network messages will look like:
 * {
 *   "ball": { x }
 * }
 */

const CAMERA_HEIGHT = 60;
const CAMERA_FOV = 15;

export default function PingPong() {
  const mouse = useRef(new Vector2(NaN));

  const game = useRef(new PingPongGame());
  const [state, setState] = useState(game.current.state());
  const session = useRef(new GameSessionRef());

  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const scale =
        (Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_HEIGHT) /
        window.innerHeight;
      const y = (window.innerHeight - e.clientY * 2) * scale;
      const x = (e.clientX * 2 - window.innerWidth) * scale;

      mouse.current.set(x, y);
    };

    const fps = 60;
    const timout = setInterval(() => {
      if (Number.isNaN(mouse.current.x)) {
        return;
      }
      // update game
      const sync = game.current.update(mouse.current);
      if (Object.entries(sync).length > 0) {
        // send data to opponent
        session.current.send(sync);
      }
      setState(game.current.state());
    }, 1000 / fps);

    window.addEventListener("pointermove", pointerMove);

    session.current.receive = (message: SyncState) => {
      game.current.receiveSyncState(message);
    };

    session.current.connect = (host: boolean) => {
      game.current.player = host ? 0 : 1;
      game.current.reset();
    };
    session.current.disconnect = () => {
      game.current.player = 0;
      game.current.paddle1 = new Vector3(NaN);
    };
    session.current.reset = () => {
      game.current.reset();
    };

    return () => {
      window.removeEventListener("pointermove", pointerMove);
      clearInterval(timout);
    };
  }, []);

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
        style={{ flex: 1, touchAction: "none", background: "green" }}
      >
        <Camera
          position={[0, 0, CAMERA_HEIGHT]}
          fov={CAMERA_FOV}
          rotation={[0, 0, game.current.player ? Math.PI : 0]}
        />
        {/* <ambientLight intensity={1} /> */}
        <directionalLight
          position={[2, 2, 5]}
          color="white"
          intensity={3}
          castShadow={true}
        />

        {/* Table, down by ball size so we bounce at z = 0 */}
        <Table />

        {/* Ball */}
        <mesh position={state.ball} castShadow={true}>
          <sphereGeometry args={[0.0656168]} />
          <meshPhongMaterial color="white" />
        </mesh>

        {/* Paddle */}
        <Paddle position={state.paddle0} rotation={[0, 0, 0]} />

        <Paddle position={state.paddle1} rotation={[0, 0, Math.PI]} />

        {/* <mesh position={target}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color={"#966F33"} />
        </mesh> */}
      </Canvas>

      <div
        style={{
          position: "fixed",
          top: "50%",
          transform: `translate(20vh,-50%)`,
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          fontSize: 20,
        }}
      >
        <div>
          {game.current.player ? game.current.score0 : game.current.score1}
        </div>
        <div>
          {game.current.player ? game.current.score1 : game.current.score0}
        </div>
      </div>
      <GameSession game="Ping-Pong" ref={session} />
    </div>
  );
}
