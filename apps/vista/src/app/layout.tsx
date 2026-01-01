import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Great_Vibes, Monsieur_La_Doulaise, Quintessential } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

const monsieurLaDoulaise = Monsieur_La_Doulaise({
  variable: "--font-monsieur",
  subsets: ["latin"],
  weight: ["400"],
});

const quintessential = Quintessential({
  variable: "--font-quintessential",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "FIELIA — Private Members Club",
  description: "An invite-only bar and supper club in Mumbai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${cormorant.variable} ${greatVibes.variable} ${monsieurLaDoulaise.variable} ${quintessential.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
