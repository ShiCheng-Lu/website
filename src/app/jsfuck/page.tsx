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

  const [showTranslation, setShowTranslation] = useState(false);

  const [encodedResult, setEncodedResult] = useState("");

  const updateCode = (code: string) => {
    setCode(code);
    const encoded = encode(code) || "";
    setEncoded(encoded);
    try {
      const encodedRes = `${eval(encoded)}`;
      setEncodedResult(encodedRes);
      // stringify result for safety
      const res = `${eval(code)}`;
      setResult(res);
      setError("");
    } catch {
      setResult("");
      setError("failed to eval expression");
    }
  };

  const theme = EditorView.theme({
    "&": { maxHeight: "200px" },
  });

  return (
    <div>
      <h1>I heard ya like JavaScript</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "80vw",
        }}
      >
        <div>
          Javascript
          <ReactCodeMirror
            className={styles.CodeMirror}
            value={code}
            onChange={(e) => updateCode(e)}
          />
        </div>
        <div>
          Javascript output
          <ReactCodeMirror className={styles.CodeMirror} value={result} />
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
          Javascript but better?
          <ReactCodeMirror
            extensions={[theme, EditorView.lineWrapping]}
            className={styles.CodeMirror}
            value={encoded}
          ></ReactCodeMirror>
        </div>
        <div>
          Javascript but better? output
          <ReactCodeMirror
            className={styles.CodeMirror}
            value={encodedResult}
          />
        </div>
      </div>

      <button onClick={() => setShowTranslation(!showTranslation)}>
        Show translation
      </button>
      {showTranslation && (
        <table>
          {translationList.map((translation) => {
            return (
              <tr key={translation.key}>
                <td>{translation.key}</td>
                <td>{translation.value}</td>
              </tr>
            );
          })}
        </table>
      )}
    </div>
  );
}
