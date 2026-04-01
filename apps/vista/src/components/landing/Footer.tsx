import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-[#E1D6C7] text-[#370D10] py-6 md:py-10 relative overflow-hidden">
      {/* Texture Overlay */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: "url('/satinbg.jpeg')",
          backgroundSize: "cover",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Logo Emblem */}
        <div className="mb-6 relative group">
          <div className="absolute inset-0 rounded-full border border-[#C5A572]/30 scale-110 group-hover:scale-125 transition-transform duration-700 ease-out" />
          <div className="absolute inset-0 rounded-full border border-[#C5A572]/10 scale-150 group-hover:scale-110 transition-transform duration-700 ease-out delay-75" />

          <div className="w-20 h-20 md:w-28 md:h-28 bg-black rounded-full p-2 overflow-hidden shadow-2xl relative z-10 border border-[#C5A572]/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-[120%] h-[120%] object-cover opacity-90"
              >
                <source
                  src="/logo-mov/F Logo - Gold-web.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-12">
            {["The Bar", "Community", "Story", "Dining", "Experience"].map(
              (item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium text-[#370D10] hover:text-[#C5A572] transition-colors duration-300 relative group"
                    style={{
                      fontFamily: "var(--font-cormorant), serif",
                    }}
                  >
                    {item}
                    <span className="absolute -bottom-2 left-1/2 w-0 h-px bg-[#C5A572] transition-all duration-300 group-hover:w-full group-hover:left-0" />
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* Divider with ornamental detail */}
        <div className="flex items-center gap-4 w-full max-w-sm mb-6 opacity-40">
          <div className="h-px bg-[#370D10] flex-1" />
          <div className="w-1.5 h-1.5 rotate-45 border border-[#370D10]" />
          <div className="h-px bg-[#370D10] flex-1" />
        </div>

        {/* Contact Info */}
        <div
          className="space-y-2 mb-4 text-[#370D10]/80"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          <p className="text-base md:text-lg tracking-wide">
            Mahalaxmi Racecourse, Mumbai, India
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full border-t border-[#370D10]/10 pt-4 mt-2 text-[#370D10]/80 text-[9px] uppercase tracking-[0.2em] md:text-xs gap-4 md:gap-0">
          <p className="md:flex-1 md:text-left text-[9px]">
            © {new Date().getFullYear()} Fielia Innercircle Hospitality LLP. All
            rights reserved.
          </p>

          <div className="flex gap-4 sm:gap-6 mt-2 md:mt-0 md:flex-1 md:justify-center">
            <Link
              href="/privacy-policy"
              className="text-[#370D10] font-bold text-[10px] md:text-xs hover:text-black transition-colors tracking-widest text-center"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-[#370D10] font-bold text-[10px] md:text-xs hover:text-black transition-colors tracking-widest text-center"
            >
              Terms of Service
            </Link>
          </div>

          <div className="flex md:flex-1 md:justify-end mt-2 md:mt-0">
            <Link
              href="https://eigensu.in"
              target="_blank"
              className="text-[#370D10] font-bold text-[10px] md:text-xs hover:text-black transition-colors tracking-widest text-center"
            >
              Powered by Eigensu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
