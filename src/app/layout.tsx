import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coup - The Game of Deception",
  description: "A digital adaptation of the Coup board game. Bluff, challenge, and eliminate your opponents.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased"
        style={{ background: 'var(--bg-0)', touchAction: 'manipulation' }}
      >
        {children}
      </body>
    </html>
  );
}
