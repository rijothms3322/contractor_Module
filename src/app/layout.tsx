import type { Metadata } from "next";
import { Manrope, Hanken_Grotesk } from "next/font/google";
import { AppProvider } from "../context/AppContext";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "Medimz | Your Health, Our World",
  description: "A premium AI-powered healthcare companion focusing on medication adherence, home diagnostics collection, and proactive wellness habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
