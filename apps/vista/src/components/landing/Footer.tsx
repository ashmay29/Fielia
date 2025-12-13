import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-[#E1D6C7] text-[#370D10] py-10 md:py-14 relative overflow-hidden">
      {/* Texture Overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: "url('/paper-texture.png')",
          backgroundSize: "cover",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Logo / Crest */}
        <div className="mb-6">
          <span
            className="text-4xl md:text-5xl font-bold text-[#370D10]"
            style={{
              fontFamily: "var(--font-great-vibes), cursive",
            }}
          >
            F
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-6 md:gap-12">
            {["The Club", "Membership", "Story", "Dining", "Experience"].map(
              (item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-[#370D10] hover:text-[#C5A572] transition-colors duration-300"
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                    }}
                  >
                    {item}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        {/* Divider */}
        <div className="w-full max-w-xs h-px bg-[#370D10]/20 mb-8" />

        {/* Contact Info */}
        <div
          className="space-y-2 mb-10"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          <p className="text-base md:text-lg tracking-wide">
            Mahalaxmi Racecourse, Mumbai, India
          </p>
          <p className="text-base md:text-lg tracking-wide">
            +91 (022) 123-4567 • concierge@fielia.com
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl text-[#370D10]/60 text-[10px] uppercase tracking-widest gap-4">
          <p>© {new Date().getFullYear()} Fielia. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-[#370D10] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#370D10] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
