"use client";

import { Canvas } from "@react-three/fiber";
import { Anchor, Ball, Cue, Table } from "./models";
import Camera from "@/util/three-camera";
import { DirectionalLight, Vector2, Vector3 } from "three";
import { useEffect, useRef, useState } from "react";
import PoolGame from "./physics";
// import { useEffect, useRef, useState } from "react"
// import PoolGame from "./physics"
// import { Vector2 } from "three";

const CAMERA_HEIGHT = 120;
const CAMERA_FOV = 70;

const ANCHOR_MOVEMENTS: { [key: string]: Vector3 } = {
  KeyW: new Vector3(0, 0.2, 0),
  KeyA: new Vector3(-0.2, 0, 0),
  KeyS: new Vector3(0, -0.2, 0),
  KeyD: new Vector3(0.2, 0, 0),
};

export default function Pool() {
  //   // const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});
  //   const [lobbyName, setLobbyName] = useState(
  //     `Lobby${Math.floor(Math.random() * 999) + 1}`
  //   );
  //   const [currLobby, setCurrLobby] = useState<string>();
  const mouse = useRef(new Vector2(NaN));
  const mouseDown = useRef(false);

  const game = useRef(new PoolGame());
  const [state, setState] = useState(game.current.state());

  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const scale =
        (Math.tan((CAMERA_FOV * Math.PI) / 360) * CAMERA_HEIGHT) /
        window.innerHeight;
      const y = (window.innerHeight - e.clientY * 2) * scale;
      const x = (e.clientX * 2 - window.innerWidth) * scale;

      mouse.current.set(x, y);
    };

    const pointerDown = (e: PointerEvent) => {
      // console.log(`pointer down ${e}`);
      mouseDown.current = true;
      pointerMove(e); // set the mouse position
    };

    const pointerUp = (e: PointerEvent) => {
      // console.log(`pointer up ${e}`);
      mouseDown.current = false;
      pointerMove(e); // set the mouse position
    };

    const keyPress = (e: KeyboardEvent) => {
      for (const key in ANCHOR_MOVEMENTS) {
        if (e.code === key) {
          const movement = ANCHOR_MOVEMENTS[key];
          game.current.anchor.position.add(movement);
          game.current.cue.position.add(movement);
        }
      }
    };

    const fps = 120;
    const subtick = 3; // simulate at smaller step then rendering for better accuracy
    let tick = 0;
    const timout = setInterval(() => {
      if (Number.isNaN(mouse.current.x)) {
        return;
      }

      // game physics is updated every ticks
      game.current.update();

      tick += 1;
      if (tick == subtick) {
        setState(game.current.state());
        tick = 0;

        // handle input
        const sync = game.current.input(
          mouse.current,
          mouseDown.current,
          subtick
        );
        if (Object.entries(sync).length > 0) {
          // send data to opponent
          // sendData(JSON.stringify(sync));
        }
      }
    }, 1000 / fps / subtick);

    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("keydown", keyPress);

    // onSnapshot(
    //   query(lobby().collection, where("answer", "==", "")),
    //   (lobbyList) => {
    //     const lobbies: { [key: string]: LobbyData } = {};
    //     lobbyList.forEach((lob) => {
    //       if (lob.exists() && lob.id != user.user.uid) {
    //         lobbies[lob.id] = lob.data() as LobbyData;
    //       }
    //     });
    //     setLobbies(lobbies);
    //   }
    // );

    // setOnMessage((message) => {
    //   const data = JSON.parse(message);
    //   game.current.receiveSyncState(data);
    // });

    // setOnConnection(() => {
    //   game.current.reset();
    // });

    return () => {
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("keydown", keyPress);
      clearInterval(timout);
    };
  }, []);

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
        <Camera fov={CAMERA_FOV} position={[0, 0, CAMERA_HEIGHT]} />

        <Table />
        <directionalLight position={[0, 0, 1]} color="white" intensity={1.3} />

        <Anchor
          position={state.anchor.position}
          rotation={state.anchor.rotation}
        />
        <Cue position={state.cue.position} rotation={state.cue.rotation} />

        {state.balls.map((ball, index) => (
          <Ball
            key={index}
            position={ball.position}
            rotation={ball.rotation}
            color={ball.color}
          />
        ))}
      </Canvas>
    </div>
  );
}
