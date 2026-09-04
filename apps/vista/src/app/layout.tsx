import type { Metadata } from "next";
import {
  Playfair_Display,
  Cormorant_Garamond,
  Great_Vibes,
  Monsieur_La_Doulaise,
  Quintessential,
} from "next/font/google";
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
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

// Rendered on the server into the HTML document so crawlers and reviewers that
// do not execute JavaScript can tie the "Fielia" brand to its legal entity.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  name: "Fielia",
  legalName: "Innercircle Hospitality LLP",
  url: "https://www.fielia.in",
  telephone: "+917738354663",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Mahalaxmi Racecourse, Keshavrao Khadye Marg",
    addressLocality: "Mumbai",
    addressRegion: "MH",
    postalCode: "400034",
    addressCountry: "IN",
  },
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

        {/* Server-rendered identity block. Must stay outside any client
            component or Suspense boundary so it is present in the raw HTML.
            Deliberately terse: the parchment footer inside MainWebsite already
            carries the trading name and city, but it only mounts client-side,
            so this strip supplies the details a no-JS reader would otherwise
            never see — full street address, contact number, operating entity. */}
        <footer
          className="relative z-10 border-t border-white/10 px-6 py-6 text-center text-xs text-white/50"
          style={{
            backgroundColor: "hsl(350 40% 8%)",
            fontFamily: "var(--font-cormorant), serif",
            letterSpacing: "0.14em",
            lineHeight: 2,
          }}
        >
          <p>
            Mahalaxmi Racecourse, Keshavrao Khadye Marg, Mumbai 400034
            <span className="mx-2 opacity-40" aria-hidden="true">
              &middot;
            </span>
            WhatsApp:{" "}
            <a
              href="https://wa.me/917738354663"
              className="underline underline-offset-2 transition-colors duration-300 hover:text-white/80"
            >
              +91 77383 54663
            </a>
          </p>
          <p className="text-white/40">
            Operated by Innercircle Hospitality LLP
          </p>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </body>
    </html>
  );
}
