import type { Metadata } from "next";
import "./ekiden.css";
import "./news.css";

export const metadata: Metadata = {
  title: "ケイテキ!ニュース | アイドル駅伝",
  description: "恵迪寮祭アイドル駅伝。6グループのファン数・GB・架空の芸能ニュース。",
  robots: {index:false,follow:false},
  referrer: "no-referrer",
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
