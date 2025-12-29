import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const panels = [
  {
    kicker: "Provenance",
    title: "Curtains Rise. FIELIA Begins.",
    body:
      "An invite-only bar by Afsana Verma, Amit Verma, and Dhaval Udeshi — designed by Gauri Khan. Inside the iconic Mahalaxmi Race Course, Fielia reimagines the aperitivo bar as a Cocktail Cinema.",
    image: "/interior/DSC02056-Edit.jpg",
    align: "right" as const,
  },
  {
    kicker: "Cocktail Cinema",
    title: "Sin & Scandal",
    body:
      "A cinematic, cocktail-forward experience: dress-circle seats, a double-height room, mezzanine galleries like theatre boxes, and a bar that plays the screen — the stage where every pour unfolds.",
    image: "/interior/DSC02076-Edit.jpg",
    align: "left" as const,
  },
  {
    kicker: "The Space",
    title: "Designed by Gauri Khan",
    body:
      "Century-old mill architecture becomes cinematic, sensual, and modern: a moody ground floor wrapped in wrought-iron stairs, with a mezzanine that mirrors vintage theatre drama.",
    image: "/interior/DSC02065-Edit.jpg",
    align: "right" as const,
  },
  {
    kicker: "Culinary Direction",
    title: "Chef Hitesh Shanbhag",
    body:
      "Aperitivo plates interpret the seven sins through precise, expressive cooking — from pillowy Sage Chèvre Gnocchi to molten Burnt Basque & Cacao Textures. Nothing overwhelms. Everything entices.",
    image: "/interior/DSC02069-Edit-2.jpg",
    align: "left" as const,
  },
];

export default function StoryPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "hsl(350 40% 8%)" }}
    >
      <div
        className="absolute inset-0 high-quality-bg"
        style={{
          backgroundImage: "url(/satinbg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0" style={{
        background:
          "radial-gradient(ellipse at center, hsl(350 45% 10% / 0.70) 0%, hsl(350 40% 7% / 0.85) 40%, hsl(350 35% 5% / 0.95) 70%, hsl(350 30% 3% / 1.00) 100%)",
      }} />

      <Navbar variants={undefined} isLogoHidden={false} isColorChanged={false} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 space-y-10 md:space-y-14">
        <header className="text-center space-y-4">
          <span
            className="text-[#E1D6C7]/80 text-xs tracking-[0.3em] uppercase"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            The Story
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-[#E1D6C7] italic"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Curtains Rise. Fielia Begins.
          </h1>
          <p
            className="text-[#E1D6C7]/85 text-sm md:text-base max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Mumbai has a new secret — and it is anything but quiet. Fielia is an invite-only bar inside the iconic Mahalaxmi Race Course, imagined as a Cocktail Cinema where every pour, every whisper, every scandal unfolds.
          </p>
        </header>

        <section className="grid gap-8 md:gap-12">
          {panels.map((panel, i) => (
            <div
              key={panel.title}
              className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[21/9] overflow-hidden rounded-sm border border-[#E1D6C7]/10"
            >
              <Image
                src={panel.image}
                alt={panel.title}
                fill
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
              <div
                className={`absolute inset-0 flex md:items-center items-end ${
                  panel.align === "right" ? "md:justify-end" : "md:justify-start"
                } justify-center`}
              >
                <div className="w-[92%] sm:w-auto sm:max-w-[620px] m-3 sm:m-6 md:m-8 bg-black/45 backdrop-blur-[3px] p-4 sm:p-6 md:p-8 border border-[#E1D6C7]/15">
                  <span
                    className="block text-[#E1D6C7]/70 text-[0.65rem] sm:text-xs tracking-[0.15em] sm:tracking-[0.25em] uppercase pb-2"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    {panel.kicker}
                  </span>
                  <h3
                    className="text-xl sm:text-2xl md:text-3xl text-[#E1D6C7] italic mb-2"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {panel.title}
                  </h3>
                  <p
                    className="text-[#E1D6C7]/85 text-sm sm:text-base leading-relaxed"
                    style={{ fontFamily: "var(--font-cormorant), serif" }}
                  >
                    {panel.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="text-center space-y-4 pb-10">
          <h4
            className="text-xl md:text-2xl text-[#E1D6C7] italic"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Details
          </h4>
          <p
            className="text-[#E1D6C7]/80 text-sm md:text-base leading-relaxed max-w-3xl mx-auto"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            The bar operates on an invite-only basis. Dining is available through advance reservations, with weekends curated exclusively for invited guests.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
