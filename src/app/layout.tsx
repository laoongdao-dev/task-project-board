import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Board",
  description: "Task Board is a visual board for organizing tasks by status and tracking work progress easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <nav style={{
          padding: "1rem",
          borderBottom: "1px solid #eaeaea",
          marginBottom: "2rem",
        }}>
          
        </nav>
        {children}
      </body>
    </html>
  );
}
