"use client";

import { CookiesProvider } from "react-cookie";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
