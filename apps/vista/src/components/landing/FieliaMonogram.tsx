'use client';
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface FieliaMonogramProps {
    isRevealed: boolean;
    onReveal: () => void;
    cursorPosition: { x: number; y: number };
}

const FieliaMonogram = ({ isRevealed, onReveal, cursorPosition }: FieliaMonogramProps) => {
    const MotionDiv = motion.div as any;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const logoCenter = typeof window !== 'undefined'
        ? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        : { x: 0, y: 0 };

    const distance = Math.sqrt(
        Math.pow(cursorPosition.x - logoCenter.x, 2) +
        Math.pow(cursorPosition.y - logoCenter.y, 2)
    );

    const isNearLogo = isMounted && distance < 150;
    const opacity = isNearLogo ? Math.max(0.15, 1 - distance / 200) : 0.03;

    return (
        <MotionDiv
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
        >
            <MotionDiv
                className="relative"
                animate={{
                    opacity: isRevealed ? 1 : opacity,
                    scale: isNearLogo ? 1.02 : 1,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Outer glow when near */}
                <MotionDiv
                    className="absolute -inset-20 rounded-full"
                    style={{
                        background: "radial-gradient(circle, hsl(40 70% 50% / 0.15) 0%, transparent 70%)",
                    }}
                    animate={{
                        opacity: isNearLogo || isRevealed ? 1 : 0,
                        scale: isRevealed ? 1.5 : 1,
                    }}
                    transition={{ duration: 0.8 }}
                />

                {/* Logo container */}
                <div className="relative">
                    {/* Art Deco frame */}
                    <svg
                        width="200"
                        height="200"
                        viewBox="0 0 200 200"
                        className="relative z-10"
                    >
                        {/* Outer decorative ring */}
                        <motion.circle
                            cx="100"
                            cy="100"
                            r="95"
                            fill="none"
                            stroke="hsl(34 30% 85%)"
                            strokeWidth="0.5"
                            initial={{ opacity: 0.1 }}
                            animate={{ opacity: isNearLogo || isRevealed ? 0.6 : 0.1 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Inner decorative ring */}
                        <motion.circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="hsl(34 30% 85%)"
                            strokeWidth="0.5"
                            initial={{ opacity: 0.05 }}
                            animate={{ opacity: isNearLogo || isRevealed ? 0.4 : 0.05 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Art Deco corner accents */}
                        <motion.g
                            initial={{ opacity: 0.1 }}
                            animate={{ opacity: isNearLogo || isRevealed ? 0.7 : 0.1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <line x1="100" y1="5" x2="100" y2="20" stroke="hsl(40 60% 55%)" strokeWidth="1" />
                            <line x1="100" y1="180" x2="100" y2="195" stroke="hsl(40 60% 55%)" strokeWidth="1" />
                            <line x1="5" y1="100" x2="20" y2="100" stroke="hsl(40 60% 55%)" strokeWidth="1" />
                            <line x1="180" y1="100" x2="195" y2="100" stroke="hsl(40 60% 55%)" strokeWidth="1" />
                        </motion.g>

                        {/* Main "F" monogram */}
                        <text
                            x="100"
                            y="115"
                            textAnchor="middle"
                            fontFamily="Playfair Display, serif"
                            fontSize="72"
                            fontWeight="500"
                            fontStyle="italic"
                            fill="hsl(34 30% 85%)"
                        >
                            F
                        </text>

                        {/* "FIELIA" text below */}
                        <motion.text
                            x="100"
                            y="155"
                            textAnchor="middle"
                            fontFamily="Playfair Display, serif"
                            fontSize="14"
                            letterSpacing="8"
                            fill="hsl(34 30% 85%)"
                            initial={{ opacity: 0.2 }}
                            animate={{ opacity: isNearLogo || isRevealed ? 0.9 : 0.2 }}
                            transition={{ duration: 0.3 }}
                        >
                            FIELIA
                        </motion.text>
                    </svg>

                    {/* Subtle inner glow */}
                    <MotionDiv
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: "radial-gradient(circle, hsl(34 30% 85% / 0.1) 0%, transparent 50%)",
                        }}
                        animate={{
                            opacity: isNearLogo || isRevealed ? 1 : 0,
                        }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

            </MotionDiv>
        </MotionDiv>
    );
};

export default FieliaMonogram;
