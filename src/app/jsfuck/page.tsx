"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { translationList, encode } from "./encode";
import ReactCodeMirror, { EditorView } from "@uiw/react-codemirror";

export default function JSFuck() {
  const [code, setCode] = useState("");
  const [encoded, setEncoded] = useState("");

  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const updateCode = (code: string) => {
    setCode(code);
    const encoded = encode(code);
    if (encoded) {
      setEncoded(encoded);
    }
    try {
      // stringify result for safety
      const res = `${eval(code)}`;
      setResult(res);
      setError("");
    } catch {
      setResult("");
      setError("failed to eval expression");
    }
  };

  return (
    <div>
      <h1>I heard ya like JavaScript</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: "100vw"
        }}
      >
        <div>
          Javascript
          <ReactCodeMirror
            className={styles.textarea}
            style={{
              width: "500px",
              maxWidth: "100%"
            }}
            value={code}
            onChange={(e) => updateCode(e)}
          ></ReactCodeMirror>
        </div>
        <div>
          Javascript but better?
          
          <ReactCodeMirror
            extensions={[EditorView.lineWrapping]}
            className={styles.textarea}
            style={{
              width: "500px",
              maxWidth: "100%"
            }}
            value={encoded}
            onChange={(e) => updateCode(e)}
          ></ReactCodeMirror>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <div>
          Javascript output
          <div>{result}</div>
          <div>{error}</div>
        </div>
        <div>Javascript but better? output</div>
      </div>

      <ul>
        {translationList.map((translation) => {
          return (
            <>
              <li>
                {translation.type}, {translation.key}, {translation.value}
              </li>
              <hr />
            </>
          );
        })}
      </ul>
    </div>
  );
}
