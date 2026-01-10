"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// github small file system

const host =
  process.env.NODE_ENV === "development" ? "localhost:3000" : "shicheng.lu";
const clientId = "Iv23li3ZLqn4DzaPQb5u";
const clientSecret = "d4cd1f87c394e306e36571bd481544baeb6c9802";

export default function GSFS() {
  const router = useRouter();

  const login = () => {
    router.push(
      `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=https://${host}/tools/gsfs`
    );
  };

  const upload = () => {};

  useEffect(() => {
    (async () => {
      const search = window.location.search.replace(/^\?/, "").split("&");
      const code = search
        .find((query) => query.startsWith("code="))
        ?.substring(5);

      if (code) {
        const res = await fetch(
          `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=https://${host}/tools/gsfs`,
          {
            method: "POST",
            body: JSON.stringify({
              client_id: clientId,
              cliend_secret: clientSecret,
              code: code,
              redirect_uri: `https://${host}/tools/gsfs`,
            }),
          }
        );
        console.log(res);
      }
    })();
  });
  //github.com/login/oauth/access_token

  https: return (
    <div>
      <div>
        <button onClick={login}>Login</button>
      </div>
      <div>
        <label>Repo name:</label>
        <input />
      </div>
      <input type="file" />
      <div>
        <button onClick={upload}>Upload</button>
      </div>
    </div>
  );
}
