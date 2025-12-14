"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { Table } from "./PingPongModels";
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

export default function PingPong() {
  const [ball, setBall] = useState(new Vector3());
  const [paddle, setPaddle] = useState(new Vector3());
  const [opponent, setOpponent] = useState(new Vector3());
  const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});
  const [lobbyName, setLobbyName] = useState(
    `Lobby${Math.floor(Math.random() * 999) + 1}`
  );
  const [hosting, setHosting] = useState(false);

  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      const zOffset = 2;

      const scale =
        (Math.tan((15 * Math.PI) / 180) * (50 - zOffset)) / window.innerHeight;
      const y = (window.innerHeight / 2 - e.clientY) * scale;
      const x = (e.clientX - window.innerWidth / 2) * scale;

      paddle.set(x, y, zOffset);

      setPaddle(paddle.clone());
      if (connected()) {
        sendData(JSON.stringify(paddle));
      }
    };

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
      if (!hosting) {
        //
      }
      opponent.set(data.x, data.y, data.z);
      setOpponent(opponent.clone());
    });

    return () => {
      window.removeEventListener("pointermove", pointerMove);
    };
  });

  const startLob = () => {
    startLobby(lobbyName);
    setHosting(true);
  };

  const endLob = () => {
    leaveLobby();
    setHosting(false);
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
      <Canvas style={{ flex: 1, touchAction: "none", background: "green" }}>
        <Camera position={[0, 0, 50]} fov={15} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} color="white" intensity={3} />

        <Table />

        {/* Ball */}
        <mesh position={ball}>
          <sphereGeometry args={[0.0656168]} />
          <meshStandardMaterial color="white" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Paddle */}
        <mesh position={paddle}>
          <mesh>
            <circleGeometry args={[0.25]} />
            <meshStandardMaterial color="red" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3]} />
            <meshStandardMaterial color={"#966F33"} />
          </mesh>
        </mesh>

        <mesh position={opponent} rotation={[0, 0, Math.PI]}>
          <mesh>
            <circleGeometry args={[0.25]} />
            <meshStandardMaterial color="red" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3]} />
            <meshStandardMaterial color={"#966F33"} />
          </mesh>
        </mesh>
      </Canvas>
      <div style={{ position: "fixed", top: 0, left: 0 }}>
        <div className={styles.LobbyCard}>
          <input
            onChange={(e) => setLobbyName(e.target.value)}
            value={lobbyName}
          />
          {!hosting ? (
            <button onClick={startLob}>Start lobby</button>
          ) : (
            <button onClick={endLob}>End lobby</button>
          )}
        </div>
        {!hosting &&
          Object.entries(lobbies).map(([id, lob]) => {
            return (
              <div className={styles.LobbyCard} key={id}>
                <p>{lob.name}</p>
                <button onClick={() => joinLobby(id, lob)}>Join lobby</button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
