"use client";

export default function UrlShortener() {
  return (
    <div>
      WIP Url shortener?
      <a href="https://google.com" target="_blank">
        Test
      </a>
      <button
        onClick={() => {
          window?.open(
            "https://google.com",
            "_blank",
            "popup noopener noreferrer"
          );
        }}
      >
        Test2
      </button>
    </div>
  );
}
