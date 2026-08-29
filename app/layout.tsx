import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://jonny7171.github.io/payable-pilot/"),
  title: "PayablePilot | Accounts payable agent run",
  description:
    "Inspect a working Strands agent run that clears matched invoices and holds price exceptions for review.",
  openGraph: {
    title: "PayablePilot | Accounts payable agent run",
    description: "A working Strands agent with explicit tools, financial checks, and a review queue.",
    images: [
      {
        url: "https://jonny7171.github.io/payable-pilot/og.png",
        width: 1200,
        height: 630,
        alt: "PayablePilot agent run log",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PayablePilot | Accounts payable agent run",
    description: "A working Strands agent with explicit tools, financial checks, and a review queue.",
    images: ["https://jonny7171.github.io/payable-pilot/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
