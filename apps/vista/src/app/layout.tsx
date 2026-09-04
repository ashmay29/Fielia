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
          className="relative z-10 w-full overflow-hidden border-t border-[#370D10]/10 bg-[#E1D6C7] px-6 py-5 text-center text-[9px] uppercase tracking-[0.2em] text-[#370D10]/80 md:text-xs"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          {/* Same satin texture the parchment footer uses, so the two read as
              one continuous surface rather than two stacked blocks. */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10 mix-blend-multiply"
            style={{
              backgroundImage: "url('/satinbg.jpeg')",
              backgroundSize: "cover",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-1">
            <p>
              Mahalaxmi Racecourse, Keshavrao Khadye Marg, Mumbai 400034
              <span className="mx-2 opacity-40" aria-hidden="true">
                &middot;
              </span>
              WhatsApp:{" "}
              <a
                href="https://wa.me/917738354663"
                className="font-bold text-[#370D10] underline underline-offset-2 transition-colors duration-300 hover:text-black"
              >
                +91 77383 54663
              </a>
            </p>
            <p>Operated by Innercircle Hospitality LLP</p>
          </div>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
      </body>
    </html>
  );
}
