import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayablePilot | The invoice exception desk",
  description:
    "A Strands agent that clears routine invoice packets and surfaces only payment exceptions.",
  openGraph: {
    title: "PayablePilot | Routine packets cleared",
    description: "Agentic orchestration. Deterministic money. Human authority.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
