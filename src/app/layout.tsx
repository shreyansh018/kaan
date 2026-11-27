import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaan — सुनो, फिर मानो",
  description:
    "A voice-first fact-check for forwarded WhatsApp voice notes in India. Forward a note, hear what is true in 20 seconds — with the source named aloud.",
};

export const viewport: Viewport = {
  themeColor: "#FAF7F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
