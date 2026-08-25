import type { Metadata } from "next";
import { WakeBackend } from "@/components/WakeBackend";
import "./globals.css";

export const metadata: Metadata = {
  title: "PureHive ESG",
  description: "PureHive ESG training process.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WakeBackend />
        {children}
      </body>
    </html>
  );
}
