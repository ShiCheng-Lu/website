"use client";

import { RefObject, useEffect, useState } from "react";
import styles from "./GameSession.module.css";
import { LobbyData, lobby } from "@/util/database";
import { and, onSnapshot, query, where } from "firebase/firestore";
import { user } from "@/util/firebase";
import {
  joinLobby,
  leaveLobby,
  sendData,
  setOnConnection,
  setOnDisconnect,
  setOnMessage,
  startLobby,
} from "@/util/peer2peer";

export class GameSessionRef {
  send: (message: any) => void = () => {};
  receive: (message: any) => void = () => {};
  connect: (host: boolean) => void = () => {};
  disconnect: () => void = () => {};
  connected: boolean = false;
  reset: () => void = () => {};
}

type GameSessionProp = {
  ref: RefObject<GameSessionRef>;
  game: string;
};

export function GameSession({ game, ref }: GameSessionProp) {
  const [session, setSession] = useState<string>();
  const [name, setName] = useState(
    `Game-${Math.floor(Math.random() * 999) + 1}`
  );
  const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});

  const start = () => {
    startLobby(name, game);
    setSession(user.user.uid);
  };
  const end = () => {
    leaveLobby();
  };
  const reset = () => {
    ref.current.reset();
  };
  const join = (id: string, data: LobbyData) => {
    setSession(id);
    joinLobby(id, data);
  };

  useEffect(() => {
    onSnapshot(
      query(
        lobby().collection,
        and(where("answer", "==", ""), where("game", "==", game))
      ),
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

    const beforeUnload = () => {
      leaveLobby();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  useEffect(() => {
    setOnMessage((message) => {
      const data = JSON.parse(message);
      ref.current.receive(data);
    });
    setOnConnection((host) => {
      ref.current.connected = true;
      ref.current.connect(host);
    });
    setOnDisconnect(() => {
      setSession(undefined);
      ref.current.connected = false;
      ref.current.disconnect();
    });
    ref.current.send = (message: any) => {
      const data = JSON.stringify(message);
      sendData(data);
    };
  }, [ref]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0 }}>
      <div className={styles.SessionCard}>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          disabled={session !== undefined}
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
