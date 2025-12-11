import { motion } from "framer-motion";

interface MainWebsiteProps {
    isVisible: boolean;
    onNavigateToInvitation?: () => void;
    onNavigateToSpotlight?: () => void;
}

const MainWebsite = ({ isVisible, onNavigateToInvitation, onNavigateToSpotlight }: MainWebsiteProps) => {
    const MotionDiv = motion.div as any;
    const MotionH1 = motion.h1 as any;
    const MotionP = motion.p as any;

    return (
        <MotionDiv
            className="absolute inset-0 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.1 }} // Instant transition for seamless flow
            style={{
                background: `
                  radial-gradient(ellipse at center top, 
                    hsl(40 35% 92%) 0%,
                    hsl(38 30% 88%) 20%,
                    hsl(36 28% 85%) 40%,
                    hsl(35 25% 82%) 60%,
                    hsl(33 22% 78%) 80%,
                    hsl(30 20% 72%) 100%
                  )
                `,
                pointerEvents: isVisible ? "auto" : "none",
            }}
        >
            {/* Temporary Dev Navigation Bar */}
            {(onNavigateToInvitation || onNavigateToSpotlight) && (
                <div
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-3 px-4 py-2 rounded-lg"
                    style={{
                        background: 'linear-gradient(180deg, hsl(350 50% 28%) 0%, hsl(350 55% 22%) 100%)',
                        border: '1px solid hsl(42 50% 45% / 0.3)',
                        boxShadow: '0 4px 20px hsl(350 50% 15% / 0.5)',
                    }}
                >
                    {onNavigateToSpotlight && (
                        <button
                            onClick={onNavigateToSpotlight}
                            className="px-4 py-2 text-[10px] tracking-widest uppercase transition-all duration-300 hover:bg-white/10 rounded"
                            style={{
                                fontFamily: 'var(--font-cormorant), serif',
                                fontWeight: 500,
                                color: 'hsl(40 35% 92%)',
                            }}
                        >
                            → Spotlight Screen
                        </button>
                    )}
                    {onNavigateToInvitation && (
                        <button
                            onClick={onNavigateToInvitation}
                            className="px-4 py-2 text-[10px] tracking-widest uppercase transition-all duration-300 hover:bg-white/10 rounded"
                            style={{
                                fontFamily: 'var(--font-cormorant), serif',
                                fontWeight: 500,
                                color: 'hsl(40 35% 92%)',
                            }}
                        >
                            → Invitation Screen
                        </button>
                    )}
                </div>
            )}

            {/* Enhanced parchment texture with grain */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.15]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Darker brown edges vignette */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse at center, 
                            transparent 0%,
                            transparent 40%,
                            hsl(30 25% 65% / 0.3) 70%,
                            hsl(25 30% 55% / 0.5) 100%
                        )
                    `,
                }}
            />

            {/* Subtle beige/cream variations */}
            <div
                className="fixed inset-0 pointer-events-none opacity-20"
                style={{
                    background: `
                        linear-gradient(135deg, 
                            hsl(45 40% 90% / 0.5) 0%,
                            transparent 30%,
                            transparent 70%,
                            hsl(35 35% 85% / 0.5) 100%
                        )
                    `,
                }}
            />

            {/* Hero Section - Minimal */}
            <section className="relative min-h-screen flex items-center justify-center px-6">
                {/* Decorative abstract shapes in background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Left abstract shape */}
                    <MotionDiv
                        className="absolute left-0 top-1/4 w-64 h-64 opacity-20"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: isVisible ? 0.2 : 0, x: isVisible ? 0 : -100 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        style={{
                            background: `radial-gradient(circle, hsl(350 45% 30% / 0.3) 0%, transparent 70%)`,
                            filter: 'blur(40px)',
                        }}
                    />

                    {/* Right abstract shape */}
                    <MotionDiv
                        className="absolute right-0 bottom-1/3 w-80 h-80 opacity-15"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: isVisible ? 0.15 : 0, x: isVisible ? 0 : 100 }}
                        transition={{ duration: 1.5, delay: 0.7 }}
                        style={{
                            background: `radial-gradient(circle, hsl(42 50% 50% / 0.2) 0%, transparent 70%)`,
                            filter: 'blur(50px)',
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    {/* Decorative Ornament */}
                    <MotionDiv
                        className="flex justify-center mb-6"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
                        transition={{ duration: 1, delay: 0.1 }}
                    >
                        <svg width="80" height="40" viewBox="0 0 80 40">
                            <line x1="0" y1="20" x2="25" y2="20" stroke="hsl(350 45% 30%)" strokeWidth="0.5" opacity="0.5" />
                            <circle cx="40" cy="20" r="3" fill="hsl(42 50% 50%)" opacity="0.7" />
                            <line x1="55" y1="20" x2="80" y2="20" stroke="hsl(350 45% 30%)" strokeWidth="0.5" opacity="0.5" />
                        </svg>
                    </MotionDiv>

                    {/* Tagline */}
                    <MotionP
                        className="text-wine-rich/50 text-[10px] tracking-[0.5em] uppercase mb-6"
                        style={{
                            fontFamily: 'var(--font-cormorant), serif',
                            fontWeight: 500
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        Members Only Since 1923
                    </MotionP>

                    {/* Main Title - Rouge Script */}
                    <MotionH1
                        className="text-8xl md:text-9xl text-wine-rich mb-8"
                        style={{
                            fontFamily: 'var(--font-great-vibes), cursive',
                            fontWeight: 400,
                            letterSpacing: '0.02em'
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        Fielia
                    </MotionH1>

                    {/* Minimal Description - Cormorant Garamond */}
                    <MotionP
                        className="text-wine-rich/70 text-lg md:text-xl max-w-md mx-auto leading-relaxed mb-12"
                        style={{
                            fontFamily: 'var(--font-cormorant), serif',
                            fontWeight: 300,
                            fontStyle: 'italic'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        An intimate supper club for the discerning.
                    </MotionP>

                    {/* Single CTA */}
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                        transition={{ duration: 1, delay: 0.7 }}
                    >
                        <button
                            className="px-10 py-4 text-xs tracking-widest uppercase transition-all duration-500 hover:shadow-lg"
                            style={{
                                fontFamily: 'var(--font-cormorant), serif',
                                fontWeight: 500,
                                letterSpacing: '0.2em',
                                background: 'linear-gradient(180deg, hsl(350 50% 28%) 0%, hsl(350 55% 22%) 100%)',
                                color: 'hsl(40 35% 92%)',
                                border: '1px solid hsl(42 50% 45% / 0.3)',
                                boxShadow: '0 4px 20px hsl(350 50% 15% / 0.3)',
                            }}
                        >
                            Request Invitation
                        </button>
                    </MotionDiv>
                </div>
            </section>

            {/* Gallery Section - Empty Image Placeholders with Wine/Maroon Accents */}
            <section className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Section Title */}
                    <MotionDiv
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2
                            className="text-4xl md:text-5xl text-wine-rich mb-3"
                            style={{
                                fontFamily: 'var(--font-great-vibes), cursive',
                                fontWeight: 400
                            }}
                        >
                            Glimpses
                        </h2>
                        <div className="w-24 h-px bg-wine-rich/30 mx-auto" />
                    </MotionDiv>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { aspect: 'aspect-[3/4]', delay: 0 },
                            { aspect: 'aspect-square', delay: 0.1 },
                            { aspect: 'aspect-square', delay: 0.2 },
                            { aspect: 'aspect-[3/4]', delay: 0.3 },
                        ].map((item, i) => (
                            <MotionDiv
                                key={i}
                                className={`${item.aspect} relative overflow-hidden group`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: item.delay }}
                                style={{
                                    background: `
                                        linear-gradient(${135 + i * 30}deg, 
                                            hsl(${350 + i * 5} 45% ${25 + i * 3}%) 0%, 
                                            hsl(${355 - i * 3} 50% ${20 + i * 2}%) 50%,
                                            hsl(${345 + i * 4} 40% ${18 + i * 3}%) 100%
                                        )
                                    `,
                                    border: '1px solid hsl(350 40% 30% / 0.2)',
                                }}
                            >
                                {/* Wine/Maroon overlay texture */}
                                <div
                                    className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                    }}
                                />

                                {/* Decorative corner accent */}
                                <div className="absolute top-3 left-3 w-8 h-8 opacity-40">
                                    <svg viewBox="0 0 32 32">
                                        <path d="M0 0 L32 0 L32 4 L4 4 L4 32 L0 32 Z" fill="none" stroke="hsl(42 50% 60%)" strokeWidth="0.5" />
                                    </svg>
                                </div>

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-wine-rich/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </MotionDiv>
                        ))}
                    </div>
                </div>
            </section>

            {/* Info Section - Minimal */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 md:gap-24">
                        {/* Location */}
                        <MotionDiv
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h3
                                className="text-xs tracking-[0.3em] uppercase text-wine-rich/40 mb-4"
                                style={{
                                    fontFamily: 'var(--font-cormorant), serif',
                                    fontWeight: 600
                                }}
                            >
                                Location
                            </h3>
                            <p
                                className="text-wine-rich/70 text-base leading-relaxed"
                                style={{
                                    fontFamily: 'var(--font-cormorant), serif',
                                    fontWeight: 300,
                                    fontStyle: 'italic'
                                }}
                            >
                                Disclosed upon membership
                            </p>
                        </MotionDiv>

                        {/* Contact */}
                        <MotionDiv
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <h3
                                className="text-xs tracking-[0.3em] uppercase text-wine-rich/40 mb-4"
                                style={{
                                    fontFamily: 'var(--font-cormorant), serif',
                                    fontWeight: 600
                                }}
                            >
                                Membership
                            </h3>
                            <p
                                className="text-wine-rich/70 text-base leading-relaxed"
                                style={{
                                    fontFamily: 'var(--font-cormorant), serif',
                                    fontWeight: 300,
                                    fontStyle: 'italic'
                                }}
                            >
                                By referral only
                            </p>
                        </MotionDiv>
                    </div>
                </div>
            </section>

            {/* Footer - Minimal */}
            <footer
                className="relative py-12 px-6"
                style={{
                    borderTop: '1px solid hsl(30 25% 60% / 0.2)',
                }}
            >
                <div className="max-w-6xl mx-auto text-center">
                    <p
                        className="text-wine-rich/30 text-[10px] tracking-[0.4em] uppercase"
                        style={{
                            fontFamily: 'var(--font-cormorant), serif',
                            fontWeight: 400
                        }}
                    >
                        Est. 1923
                    </p>
                </div>
            </footer>
        </MotionDiv>
    );
};

export default MainWebsite;
