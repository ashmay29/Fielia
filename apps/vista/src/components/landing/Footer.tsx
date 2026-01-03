import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-[#E1D6C7] text-[#370D10] py-10 md:py-16 relative overflow-hidden">
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
        <div className="mb-8 relative group">
          <div className="absolute inset-0 rounded-full border border-[#C5A572]/30 scale-110 group-hover:scale-125 transition-transform duration-700 ease-out" />
          <div className="absolute inset-0 rounded-full border border-[#C5A572]/10 scale-150 group-hover:scale-110 transition-transform duration-700 ease-out delay-75" />

          <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-full p-2 overflow-hidden shadow-2xl relative z-10 border border-[#C5A572]/20">
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
        <nav className="mb-8">
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
              )
            )}
          </ul>
        </nav>

        {/* Divider with ornamental detail */}
        <div className="flex items-center gap-4 w-full max-w-sm mb-8 opacity-40">
          <div className="h-px bg-[#370D10] flex-1" />
          <div className="w-1.5 h-1.5 rotate-45 border border-[#370D10]" />
          <div className="h-px bg-[#370D10] flex-1" />
        </div>

        {/* Contact Info */}
        <div
          className="space-y-2 mb-10 text-[#370D10]/80"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          <p className="text-base md:text-lg tracking-wide">
            Mahalaxmi Racecourse, Mumbai, India
          </p>
          <p className="text-base md:text-lg tracking-wide font-light">
            <span className="font-normal">+91 (022) 123-4567</span>{" "}
            <span className="mx-2 text-[#C5A572]">•</span>{" "}
            <span className="font-normal">concierge@fielia.com</span>
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full border-t border-[#370D10]/10 pt-6 mt-2 text-[#370D10]/50 text-[9px] uppercase tracking-[0.2em]">
          <p className="md:flex-1 md:text-left">
            © {new Date().getFullYear()} Fielia. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0 md:flex-1 md:justify-center">
            <Link href="#" className="hover:text-[#370D10] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#370D10] transition-colors">
              Terms of Service
            </Link>
          </div>

          <div className="flex md:flex-1 md:justify-end mt-4 md:mt-0">
            <Link
              href="https://eigensu.com"
              target="_blank"
              className="text-[#370D10]/80 hover:text-[#370D10] transition-colors tracking-widest"
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
