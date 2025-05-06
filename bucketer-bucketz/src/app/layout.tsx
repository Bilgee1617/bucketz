import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exposing myself for this project",
  description: "Look at all my dm's",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className = "bg-white">{children}</body>
    </html>
  );
}