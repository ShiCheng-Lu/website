import { usePathname } from "next/navigation";

export default function UrlRedirect() {
  const url = usePathname();

  if (window && url) {
    const id = url.slice("/url/".length);
    if (id === "google") {
      window?.open("https://google.com", "_self", "noopener noreferrer");
    }
  }
  return <div></div>;
}
