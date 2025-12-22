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
let onConnection = () => {};

const USERNAME = "20466bc28b62b2c87a299b2e";
const PASSWORD = "pgWt7dj0H4i/WkRh";

const OPEN_RELAY_ICE_SERVERS = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:standard.relay.metered.ca:80",
    username: USERNAME,
    credential: PASSWORD,
  },
  {
    urls: "turn:standard.relay.metered.ca:80?transport=tcp",
    username: USERNAME,
    credential: PASSWORD,
  },
  {
    urls: "turn:standard.relay.metered.ca:443",
    username: USERNAME,
    credential: PASSWORD,
  },
  {
    urls: "turns:standard.relay.metered.ca:443?transport=tcp",
    username: USERNAME,
    credential: PASSWORD,
  },
];

const ICE_SERVERS = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
    ],
  },
  ...(process.env.NODE_ENV === "production" ? OPEN_RELAY_ICE_SERVERS : []),
];

export async function startLobby(lobbyName?: string) {
  if (pc) {
    console.error("existing connection");
    return;
  }

  pc = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });
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

      onConnection();
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

  pc = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });
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

export function setOnConnection(handler: () => void) {}

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
