import Advertisement from "@/components/Advertisement";
import { CgUnavailable } from "react-icons/cg";

export function ViolaAdvert() {
  return (
    <Advertisement>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1>NO MORE VIOLINS</h1>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: 1.3,
            }}
          ></div>
          <img
            src="violin.png"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(60deg)",
              width: "90%",
              height: "auto",
            }}
          ></img>
          <CgUnavailable
            size={400}
            color="darkred"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              height: "auto",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
        <h1>VIOLINS IS NOT THE ANSWER</h1>
        <p
          style={{
            marginLeft: "auto",
            marginRight: 20,
            fontSize: 12,
            transform: "translate(0, -10px)",
          }}
        >
          this message is brought to you by viola gang
        </p>
      </div>
    </Advertisement>
  );
}
