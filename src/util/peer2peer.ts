import {
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { LobbyData, lobby } from "./database";

let pc: RTCPeerConnection | undefined;
let channel: RTCDataChannel | undefined;
let onMessage = (message: string) => {};

export async function startLobby(lobbyName?: string) {
  if (pc) {
    console.error("existing connection");
    return;
  }

  pc = new RTCPeerConnection();
  pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    console.log(
      `onIceCandidate ${JSON.stringify(e)}  ${JSON.stringify(e.candidate)}`
    );
    const message: RTCIceCandidateInit = {};
    if (e.candidate) {
      message.candidate = e.candidate.candidate;
      message.sdpMid = e.candidate.sdpMid;
      message.sdpMLineIndex = e.candidate.sdpMLineIndex;
    }
    lobby().update({
      ice: arrayUnion(message),
    } as any);
  };
  pc.addIceCandidate();
  channel = pc.createDataChannel("channel");
  channel.onopen = (e) => {
    console.log(`opened ${JSON.stringify(e)}`);
  };
  channel.onclose = (e) => {
    console.log(`closed ${JSON.stringify(e)}`);
  };
  channel.onmessage = (e) => {
    // console.log(`message ${JSON.stringify(e)}`);
    onMessage(e.data);
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  console.log("startLobby");

  await lobby().create({
    createdAt: serverTimestamp() as any,
    offer: offer.sdp ?? "",
    answer: "",
    ice: [],
    name: lobbyName ?? "",
  });

  // handle connection and ice update
  onSnapshot(lobby().ref(), async (x) => {
    if (!x.exists()) {
      return;
    }
    if (!pc) {
      console.error("No peer connection");
      return;
    }
    const lobby = x.data();
    if (lobby.answer == "") {
      return;
    }
    if (!pc.remoteDescription) {
      await pc.setRemoteDescription({ type: "answer", sdp: lobby.answer });
    }

    for (const candidate of lobby.ice) {
      pc.addIceCandidate(candidate);
    }
  });
}

export async function joinLobby(id: string, l: LobbyData) {
  if (pc) {
    console.error("existing connection");
    return;
  }

  pc = new RTCPeerConnection();
  pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
    console.log(
      `onIceCandidate ${JSON.stringify(e)}  ${JSON.stringify(e.candidate)}`
    );
    const message: RTCIceCandidateInit = {};
    if (e.candidate) {
      message.candidate = e.candidate.candidate;
      message.sdpMid = e.candidate.sdpMid;
      message.sdpMLineIndex = e.candidate.sdpMLineIndex;
    }
    lobby().update(
      {
        ice: arrayUnion(message),
      } as any,
      id
    );
  };
  pc.ondatachannel = (e) => {
    console.log("Got data channel");
    channel = e.channel;
    channel.onopen = (e) => {
      console.log(`opened ${JSON.stringify(e)}`);
    };
    channel.onclose = (e) => {
      console.log(`closed ${JSON.stringify(e)}`);
    };
    channel.onmessage = (e) => {
      // console.log(`message ${JSON.stringify(e)}`);
      onMessage(e.data);
    };
  };
  await pc.setRemoteDescription({ type: "offer", sdp: l.offer });
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  console.log(`sending answer ${answer.sdp}`);

  await lobby().update(
    {
      answer: answer.sdp,
    } as any,
    id
  );

  for (const candidate of l.ice) {
    pc.addIceCandidate(candidate);
  }
}

export async function sendData(message: string) {
  if (!pc) {
    console.log("no peer connection");
    return;
  }
  if (!channel) {
    console.log("no channel");
    return;
  }
  channel.send(message);
}

export function setOnMessage(handler: (m: string) => void) {
  onMessage = handler;
}

export function connected() {
  return Boolean(channel && pc?.remoteDescription);
}

export async function leaveLobby() {
  if (pc) {
    pc.close();
    pc = undefined;
  }

  await lobby().delete();
}
