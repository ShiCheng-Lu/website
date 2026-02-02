"use client";

import { useParams } from "next/navigation";

export default function Something() {
  const params = useParams();
  if (window && params.id === "google") {
    window.location.assign("https://google.com");
  }
  return <div>This shortened url is not real</div>;
}
