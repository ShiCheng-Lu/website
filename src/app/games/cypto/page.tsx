"use client";

import { useState } from "react";

export default function Crypto() {
  const [messages, setMessage] = useState([]);

  const decode = (message: string) => {
    return "";
  };

  return (
    <div>
      <table>
        {messages.map((message) => (
          <div>
            <p>{message}</p>
            <p>{decode(message)}</p>
          </div>
        ))}
      </table>
    </div>
  );
}
