"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { translationList, encode } from "./encode";
import ReactCodeMirror, { EditorView } from "@uiw/react-codemirror";

export default function JSFuck() {
  const [code, setCode] = useState("\n\n\n\n\n");
  const [encoded, setEncoded] = useState("");

  const [result, setResult] = useState("");

  const [showTranslation, setShowTranslation] = useState(false);

  const [encodedResult, setEncodedResult] = useState("");

  const updateCode = (code: string) => {
    setCode(code);
    const encoded = encode(code) || "";
    setEncoded(encoded);
    try {
      const res = `${eval(code)}`;
      setResult(res);
    } catch {
      setResult("⚠ Error");
    }
  };

  useEffect(() => {
    try {
      setEncodedResult(`${eval(encoded)}`);
    } catch {
      setEncodedResult("⚠ Error");
    }
  }, [encoded]);

  const theme = EditorView.theme({
    "&": { maxHeight: "200px" },
  });

  return (
    <div className={styles.JSFuck}>
      <h1>I heard ya like JavaScript</h1>
      <table>
        <tr>
          <td>
            <div>
              Javascript
              <ReactCodeMirror
                className={styles.CodeMirror}
                value={code}
                onChange={updateCode}
              />
            </div>
          </td>
          <td>
            <div>
              Javascript output
              <ReactCodeMirror className={styles.CodeMirror} value={result} />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              Javascript but better?
              <ReactCodeMirror
                extensions={[theme, EditorView.lineWrapping]}
                className={styles.CodeMirror}
                value={encoded}
                onChange={setEncoded}
              ></ReactCodeMirror>
            </div>
          </td>
          <td>
            <div>
              Back translation
              <ReactCodeMirror
                readOnly
                className={styles.CodeMirror}
                value={encodedResult}
              />
            </div>
          </td>
        </tr>
      </table>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "80vw",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      ></div>

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
