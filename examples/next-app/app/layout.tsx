import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "AVL — Agent View Layer Demo",
  description: "Producer-side rendering for AI agents",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
