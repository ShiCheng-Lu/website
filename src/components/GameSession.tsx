"use client";

import { useEffect, useState } from "react";
import styles from "./GameSession.module.css";
import { LobbyData } from "@/util/database";

type GameSessionRef = {
  onStart: () => void;
};

type GameSessionProp = {
  ref: GameSessionRef;
  game: string;
};

export function GameSession({ game, ref }: GameSessionProp) {
  const [session, setSession] = useState();
  const [name, setName] = useState(
    `Game-${Math.floor(Math.random() * 999) + 1}`
  );
  const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});

  const start = () => {};
  const end = () => {};
  const reset = () => {};
  const join = (id: string, data: LobbyData) => {};

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    // setOnMessage((message) => {
    //   const data = JSON.parse(message);
    //   game.current.receiveSyncState(data);
    // });
    // setOnConnection(() => {
    //   game.current.reset();
    // });
  }, [ref]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0 }}>
      <div className={styles.SessionCard}>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          disabled={session != undefined}
        />
        {!session ? (
          <button onClick={start}>Start lobby</button>
        ) : (
          <button onClick={end}>Leave lobby</button>
        )}
        <button onClick={reset}>Reset</button>
      </div>
      {!session &&
        Object.entries(lobbies).map(([id, lob]) => {
          return (
            <div className={styles.SessionCard} key={id}>
              <p>{lob.name}</p>
              <button onClick={() => join(id, lob)}>Join lobby</button>
            </div>
          );
        })}
    </div>
  );
}
