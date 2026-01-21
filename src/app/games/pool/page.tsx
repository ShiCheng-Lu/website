"use client";

import { Canvas } from "@react-three/fiber";
import { Anchor, Ball, Cue, Table } from "./models";
import Camera from "@/util/three-camera";
import { DirectionalLight, Euler, Vector2, Vector3 } from "three";
import { useEffect, useRef, useState } from "react";
import PoolGame, { TABLE_WIDTH } from "./physics";
import { GameSession, GameSessionRef } from "@/components/GameSession";
import { SyncState } from "./game";
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

  const [pov, setPOV] = useState(false);
  const camera = useRef({
    fov: CAMERA_FOV,
    position: new Vector3(0, 0, CAMERA_HEIGHT),
    rotation: new Euler(0, 0, 0),
  });
  const session = useRef(new GameSessionRef());

  const togglePOV = () => {
    if (pov) {
      camera.current.position = new Vector3(0, 0, CAMERA_HEIGHT);
      camera.current.rotation = new Euler(0, 0, 0);
    } else {
      camera.current.rotation = new Euler(
        (Math.PI / 180) * 60,
        0,
        Math.atan2(
          state.anchor.position.x - state.balls[0].position.x,
          state.balls[0].position.y - state.anchor.position.y
        ),
        "ZYX"
      );
      camera.current.position = state.anchor.position
        .clone()
        .add(new Vector3(0, 0, 50).applyEuler(camera.current.rotation));
    }
    setPOV(!pov);
  };

  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const scale = Math.tan((CAMERA_FOV * Math.PI) / 360) / window.innerHeight;
      const direction = new Vector3(
        (e.clientX * 2 - window.innerWidth) * scale,
        (window.innerHeight - e.clientY * 2) * scale,
        -1
      ).applyEuler(camera.current.rotation);

      const t = -camera.current.position.z / direction.z;
      const x = camera.current.position.x + direction.x * t;
      const y = camera.current.position.y + direction.y * t;

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
          console.log("sending");
          session.current.send(sync);
        }
      }
    }, 1000 / fps / subtick);

    session.current.receive = (message: SyncState) => {
      if (message.balls) {
        console.log(message.balls);
        for (let i = 0; i < message.balls.length; ++i) {
          const ball = message.balls[i];
          game.current.balls[i].position.copy(ball.position);
          game.current.balls[i].velocity.copy(ball.velocity);
          game.current.balls[i].angular_position.copy(ball.angular_position);
          game.current.balls[i].angular_velocity.copy(ball.angular_velocity);
        }
      }
    };

    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("keydown", keyPress);

    return () => {
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("keydown", keyPress);
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
        style={{ flex: 1, touchAction: "none", background: "gray" }}
      >
        <Camera
          fov={camera.current.fov}
          position={camera.current.position}
          rotation={camera.current.rotation}
        />

        <Table />
        <directionalLight position={[0, 0.2, 1]} color="white" intensity={0.4} />
        {/* <directionalLight position={[0, -1, 1]} color="white" intensity={0.25} />
        <directionalLight position={[1, 0, 1]} color="white" intensity={0.25} />
        <directionalLight position={[-1, 0, 1]} color="white" intensity={0.25} /> */}
        <ambientLight intensity={0.5} />
        <rectAreaLight
          position={[0, 0, 30]}
          width={TABLE_WIDTH * 2}
          height={TABLE_WIDTH * 4}
          intensity={0.4}
        />

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
      <div style={{ position: "fixed", right: 10, bottom: 10 }}>
        <button
          onClick={togglePOV}
          style={{ width: 75, height: 75, borderRadius: 30 }}
        >
          POV
        </button>
      </div>
      <GameSession game="Pool" ref={session} />
    </div>
  );
}
