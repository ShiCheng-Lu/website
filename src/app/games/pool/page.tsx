"use client";

import { Canvas } from "@react-three/fiber";
import { Ball, Table } from "./models";
import Camera from "@/util/three-camera";
import { DirectionalLight } from "three";
import { useRef, useState } from "react";
import PoolGame from "./physics";
// import { useEffect, useRef, useState } from "react"
// import PoolGame from "./physics"
// import { Vector2 } from "three";

// const CAMERA_HEIGHT = 1;

export default function Pool() {
  //   // const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});
  //   const [lobbyName, setLobbyName] = useState(
  //     `Lobby${Math.floor(Math.random() * 999) + 1}`
  //   );
  //   const [currLobby, setCurrLobby] = useState<string>();
  //   const mouse = useRef(new Vector2(NaN));

  const game = useRef(new PoolGame());
  const [state, setState] = useState(game.current.state());

  //   useEffect(() => {
  //     const pointerMove = (e: PointerEvent) => {
  //       const scale =
  //         (Math.tan((15 * Math.PI) / 180) * CAMERA_HEIGHT) / window.innerHeight;
  //       const y = (window.innerHeight / 2 - e.clientY) * scale;
  //       const x = (e.clientX - window.innerWidth / 2) * scale;

  //       mouse.current.set(x, y);
  //     };

  //     const fps = 60;
  //     const timout = setInterval(() => {
  //       if (Number.isNaN(mouse.current.x)) {
  //         return;
  //       }
  //       // update game
  //       const sync = game.current.update(mouse.current);
  //       if (Object.entries(sync).length > 0) {
  //         // send data to opponent
  //         sendData(JSON.stringify(sync));
  //       }
  //       setState(game.current.state());
  //     }, 1000 / fps);

  //     window.addEventListener("pointermove", pointerMove);

  //     onSnapshot(
  //       query(lobby().collection, where("answer", "==", "")),
  //       (lobbyList) => {
  //         const lobbies: { [key: string]: LobbyData } = {};
  //         lobbyList.forEach((lob) => {
  //           if (lob.exists() && lob.id != user.user.uid) {
  //             lobbies[lob.id] = lob.data() as LobbyData;
  //           }
  //         });
  //         setLobbies(lobbies);
  //       }
  //     );

  //     setOnMessage((message) => {
  //       const data = JSON.parse(message);
  //       game.current.receiveSyncState(data);
  //     });

  //     setOnConnection(() => {
  //       game.current.reset();
  //     });

  //     return () => {
  //       window.removeEventListener("pointermove", pointerMove);
  //       clearInterval(timout);
  //     };
  //   }, []);

  //   const startLob = () => {
  //     startLobby(lobbyName);
  //     setCurrLobby(user.user.uid);
  //     resetGame();
  //   };

  //   const endLob = () => {
  //     leaveLobby();
  //     setCurrLobby(undefined);
  //     if (currLobby != user.user.uid) {
  //       setLobbyName(`Lobby${Math.floor(Math.random() * 999) + 1}`);
  //       game.current.player = 0;
  //     }
  //     game.current.paddle1 = new Vector3(NaN);
  //     // go back to AI opponent
  //   };

  //   const joinLob = (id: string, lob: LobbyData) => {
  //     joinLobby(id, lob);
  //     setCurrLobby(id);
  //     setLobbyName(lob.name);
  //     resetGame();
  //     game.current.player = 1;
  //   };

  //   const resetGame = () => {
  //     game.current.reset();
  //   };

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
        <Camera fov={70} position={[0, 0, 100]} />

        <Table />
        <directionalLight
          position={[0, 0, 1]}
          color="white"
          intensity={1.3}
          castShadow={true}
        />

        {state.balls.map((ball, index) => (
          <Ball
            key={index}
            position={ball.position}
            rotation={ball.angular_position}
            color={ball.color}
          />
        ))}
      </Canvas>
    </div>
  );
}
