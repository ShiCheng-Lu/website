"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { DirectionalLight, OrthographicCamera, Vector3 } from "three";
import { Paddle, Table } from "./PingPongModels";
import Camera from "@/util/three-camera";
import {
  connected,
  joinLobby,
  leaveLobby,
  sendData,
  setOnMessage,
  startLobby,
} from "@/util/peer2peer";
import { LobbyData, lobby } from "@/util/database";
import styles from "./page.module.css";
import { onSnapshot, query, where } from "firebase/firestore";
import { user } from "@/util/firebase";
import { clamp } from "three/src/math/MathUtils.js";

/**
 * Ping pong network messages will look like:
 * {
 *   "ball": { x }
 * }
 */

const PADDLE_HEIGHT = 0.4;
const BALL_START = new Vector3(0, -3.5, 0.3);

export default function PingPong() {
  const [ball, setBall] = useState(BALL_START.clone());
  const [ballVel, setBallVel] = useState(new Vector3());
  const [paddle, setPaddle] = useState(new Vector3(0, -5, PADDLE_HEIGHT));
  const [opponent, setOpponent] = useState(new Vector3(0, 3.5, PADDLE_HEIGHT));
  const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});
  const [lobbyName, setLobbyName] = useState(
    `Lobby${Math.floor(Math.random() * 999) + 1}`
  );
  const [currLobby, setCurrLobby] = useState<string>();
  const hosting = useRef(true);
  const canHit = useRef(true);
  const mouse = useRef(new Vector3());

  const [target, setTarget] = useState(new Vector3());

  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const scale =
        (Math.tan((15 * Math.PI) / 180) * (50 - PADDLE_HEIGHT)) /
        window.innerHeight;
      const y = Math.min((window.innerHeight / 2 - e.clientY) * scale, -0.3);
      const x = (e.clientX - window.innerWidth / 2) * scale;

      if (hosting.current) {
        mouse.current.set(x, y, PADDLE_HEIGHT);
      } else {
        mouse.current.set(-x, -y, PADDLE_HEIGHT);
      }
    };

    const fps = 60;
    const timout = setInterval(() => {
      const newPaddle = mouse.current.clone();
      const newBall = ball.clone().add(ballVel);

      // handle collision with the ball
      // completely change the paddle's movement into the reference frame of the ball
      // and check for (0,0) for a collision
      const start = paddle.clone().sub(ball);
      const end = newPaddle.clone().sub(newBall);
      // crosses in x and different in y vel
      let hit = false;
      if (
        canHit.current &&
        start.y > 0 != end.y > 0 &&
        end.y - start.y > 0 != ballVel.y > 0
      ) {
        // interpolate the paddle position at y=0
        const a = start.x * (start.y / (start.y - end.y));
        const b = end.x * (end.y / (end.y - start.y));
        const x = a + b;
        if (Math.abs(x) - 0.25 < 0) {
          // reflect across vertical axes
          let target = ballVel.clone().multiplyScalar(1);
          target.y *= -1;

          // add paddle velocity
          const paddleVel = newPaddle.clone().sub(paddle).multiplyScalar(0.5);
          target.add(paddleVel);

          // target location is based on velocity
          target.multiply({ x: 20, y: 10, z: 0 });
          target.x = clamp(target.x, -2, 2);
          target.y = clamp(target.y, -4, 4);

          setTarget(target);

          ballVel.copy(target);
          ballVel.sub(ball).multiplyScalar(0.02);
          ballVel.z = 0;
          setBallVel(paddleVel);
          console.log(
            `collided ${JSON.stringify(ball)} ${JSON.stringify(paddleVel)}`
          );
          canHit.current = false;
          hit = true;
        }
      }

      if (Math.abs(ball.y) > 10) {
        newBall.copy(BALL_START.clone());
        ballVel.copy(new Vector3());
        setBallVel(new Vector3());
        console.log(`resetting`);
        canHit.current = true;
      }

      const data: { paddle?: Vector3; ball?: Vector3; vel?: Vector3 } = {};
      if (newPaddle.distanceToSquared(paddle) != 0) {
        data.paddle = newPaddle;
      }
      if (hit) {
        data.ball = newBall;
        data.vel = ballVel;
      }
      if (Object.keys(data).length > 0) {
        sendData(JSON.stringify(data));
      }

      // update paddle location, we also need to update paddle, because the const reference
      // it's janky code I know, but otherwise need to maintain another ref.
      paddle.copy(newPaddle);
      setPaddle(newPaddle);
      ball.copy(newBall);
      setBall(newBall);
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
      if (data.paddle) {
        opponent.copy(data.paddle);
        setOpponent(opponent.clone());
      }
      if (data.ball) {
        ball.copy(data.ball);
        setBall(ball.clone());
        canHit.current = true;
      }
      if (data.vel) {
        ballVel.copy(data.vel);
        setBallVel(ballVel.clone());
        canHit.current = true;
      }
    });

    return () => {
      window.removeEventListener("pointermove", pointerMove);
      clearInterval(timout);
      console.log("Cleared");
    };
  }, []);

  const startLob = () => {
    startLobby(lobbyName);
    setCurrLobby(user.user.uid);
  };

  const endLob = () => {
    leaveLobby();
    setCurrLobby(undefined);
    if (currLobby != user.user.uid) {
      setLobbyName(`Lobby${Math.floor(Math.random() * 999) + 1}`);
      hosting.current = true;
    }
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
          position={[0, 0, 50]}
          fov={15}
          rotation={[0, 0, !hosting.current ? Math.PI : 0]}
        />
        {/* <ambientLight intensity={1} /> */}
        <directionalLight
          position={[5, 5, 5]}
          color="white"
          intensity={3}
          castShadow={true}
        />

        <Table />

        {/* Ball */}
        <mesh position={ball} castShadow={true}>
          <sphereGeometry args={[0.0656168]} />
          <meshPhongMaterial color="white" />
        </mesh>

        {/* Paddle */}
        <Paddle
          position={paddle}
          rotation={[0, 0, !hosting.current ? Math.PI : 0]}
        />

        <Paddle
          position={opponent}
          rotation={[0, 0, hosting.current ? Math.PI : 0]}
        />

        {/* <mesh position={target}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial color={"#966F33"} />
        </mesh> */}
      </Canvas>
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
        </div>
        {!currLobby &&
          Object.entries(lobbies).map(([id, lob]) => {
            return (
              <div className={styles.LobbyCard} key={id}>
                <p>{lob.name}</p>
                <button
                  onClick={() => {
                    joinLobby(id, lob);
                    setCurrLobby(id);
                    setLobbyName(lob.name);
                    hosting.current = false;
                  }}
                >
                  Join lobby
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
