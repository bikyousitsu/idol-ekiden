import type { Metadata } from "next";
import "./ekiden.css";

export const metadata: Metadata = {
  title: "アイドル駅伝｜KEITEKI RECORDS",
  description: "6グループのファン数・GB・芸能ニュースと運営入力。恵迪寮祭アイドル駅伝。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
