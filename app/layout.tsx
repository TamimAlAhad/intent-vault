import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "IntentVault",
  description: "Save links, screenshots, and notes with AI-detected intent."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
