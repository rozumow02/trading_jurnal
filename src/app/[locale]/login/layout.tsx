import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kirish — Trading Journal",
  description: "Trading Journal-ga kirish sahifasi",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // Login sahifasida Sidebar va Header yo'q — to'g'ridan-to'g'ri children render qilamiz
  return <>{children}</>;
}
