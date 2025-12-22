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
import PingPongGame from "./physics";

/**
 * Ping pong network messages will look like:
 * {
 *   "ball": { x }
 * }
 */

const CAMERA_HEIGHT = 60;

export default function PingPong() {
  const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});
  const [lobbyName, setLobbyName] = useState(
    `Lobby${Math.floor(Math.random() * 999) + 1}`
  );
  const [currLobby, setCurrLobby] = useState<string>();
  const mouse = useRef(new Vector2(NaN, NaN));

  const game = useRef(new PingPongGame());
  const [state, setState] = useState(game.current.state());

  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const scale =
        (Math.tan((15 * Math.PI) / 180) * CAMERA_HEIGHT) / window.innerHeight;
      const y = (window.innerHeight / 2 - e.clientY) * scale;
      const x = (e.clientX - window.innerWidth / 2) * scale;

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
        sendData(JSON.stringify(sync));
      }
      setState(game.current.state());
    }, 1000 / fps);

    window.addEventListener("pointermove", pointerMove);

    onSnapshot(
      query(lobby().collection, where("answer", "==", "")),
      (lobbyList) => {
        const lobbies: { [key: string]: LobbyData } = {};
        lobbyList.forEach((lob) => {
          if (lob.exists() && lob.id != user.user.uid) {
            lobbies[lob.id] = lob.data() as LobbyData;
          }
        });
        setLobbies(lobbies);
      }
    );

    setOnMessage((message) => {
      const data = JSON.parse(message);
      game.current.receiveSyncState(data);
    });

    setOnConnection(() => {
      game.current.reset();
    });

    return () => {
      window.removeEventListener("pointermove", pointerMove);
      clearInterval(timout);
    };
  }, []);

  const startLob = () => {
    startLobby(lobbyName);
    setCurrLobby(user.user.uid);
    resetGame();
  };

  const endLob = () => {
    leaveLobby();
    setCurrLobby(undefined);
    if (currLobby != user.user.uid) {
      setLobbyName(`Lobby${Math.floor(Math.random() * 999) + 1}`);
      game.current.player = 0;
    }
    game.current.paddle1 = new Vector3(NaN);
    // go back to AI opponent
  };

  const joinLob = (id: string, lob: LobbyData) => {
    joinLobby(id, lob);
    setCurrLobby(id);
    setLobbyName(lob.name);
    resetGame();
    game.current.player = 1;
  };

  const resetGame = () => {
    game.current.reset();
  };

  // const light = useMemo(() => {
  //   const l = new DirectionalLight();
  //   l.intensity = 0.5;
  //   l.position.set(100, 100, 100);
  //   l.
  // }, []);

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
          fov={15}
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

      <div style={{ position: "fixed", top: 0, left: 0 }}>
        <div className={styles.LobbyCard}>
          <input
            onChange={(e) => setLobbyName(e.target.value)}
            value={lobbyName}
            disabled={currLobby != undefined}
          />
          {!currLobby ? (
            <button onClick={startLob}>Start lobby</button>
          ) : (
            <button onClick={endLob}>Leave lobby</button>
          )}
          <button onClick={resetGame}>Reset</button>
        </div>
        {!currLobby &&
          Object.entries(lobbies).map(([id, lob]) => {
            return (
              <div className={styles.LobbyCard} key={id}>
                <p>{lob.name}</p>
                <button onClick={() => joinLob(id, lob)}>Join lobby</button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
