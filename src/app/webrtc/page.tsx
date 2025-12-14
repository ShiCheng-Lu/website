"use client";

import { LobbyData, lobby } from "@/util/database";
import { joinLobby, leaveLobby, startLobby, sendData } from "@/util/peer2peer";
import { where } from "firebase/firestore";
import { useState } from "react";

export default function WebRTC() {
  const [message, setMessage] = useState("");
  const [lobbies, setLobbies] = useState<{ [key: string]: LobbyData }>({});

  const getLobbies = async () => {
    const res = await lobby().query(where("answer", "==", ""));
    setLobbies(res);
    console.log(res);
  };

  return (
    <div>
      <div>
        <button onClick={() => startLobby()}>Start</button>
      </div>
      <button onClick={getLobbies}>Get lobbies</button>

      <div>
        {Object.keys(lobbies).map((id) => {
          return (
            <div key={id}>
              {id}{" "}
              <button onClick={() => joinLobby(id, lobbies[id])}>Join</button>
            </div>
          );
        })}
      </div>
      <div>
        <input value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={() => sendData(message)}>Send</button>
      </div>
      <div>
        <button onClick={leaveLobby}>Close</button>
      </div>
    </div>
  );
}
