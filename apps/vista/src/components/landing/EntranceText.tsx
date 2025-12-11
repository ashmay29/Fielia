'use client';
import { motion } from "framer-motion";
import { useEffect } from "react";

interface EntranceTextProps {
    startDelay: number;
    onComplete: () => void;
}

const EntranceText = ({ startDelay, onComplete }: EntranceTextProps) => {
    const MotionP = motion.p as any;

    useEffect(() => {
        // Total duration: startDelay (3s) + fade-in (2.5s) + hold (1s) + fade-out (0.8s) = 7.3s
        const totalDuration = startDelay + 2500 + 1000 + 800;

        const timer = setTimeout(() => {
            onComplete();
        }, totalDuration);

        return () => clearTimeout(timer);
    }, [startDelay, onComplete]);

    return (
        <MotionP
            className="whispered-text fixed inset-0 flex items-center justify-center text-center px-6"
            style={{
                fontFamily: 'var(--font-playfair), serif',
                fontStyle: 'italic',
                fontSize: '1.5rem',
                color: 'hsl(34 30% 85%)',
                pointerEvents: 'none',
                zIndex: 10,
            }}
            initial={{ opacity: 0 }}
            animate={{
                opacity: [
                    0,           // Start invisible
                    0,           // Stay invisible during delay
                    0.45,        // Fade in to peak
                    0.45,        // Hold at peak
                    0,           // Fade out
                ],
            }}
            transition={{
                duration: 5.3,  // Total animation duration (slower for more dramatic effect)
                times: [0, 0.57, 0.85, 0.92, 1], // Adjusted keyframe timing for slower fade-in
                ease: "easeInOut",
            }}
        >
            You may enter.
        </MotionP>
    );
};

export default EntranceText;
