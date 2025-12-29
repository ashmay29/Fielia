'use client';

import { motion } from "framer-motion";
import { useEffect } from "react";

interface EntranceTextProps {
    startDelay: number; // in ms
    onComplete: () => void;
}

const EntranceText = ({ startDelay, onComplete }: EntranceTextProps) => {
    const fadeInDuration = 3.2;
    const holdDuration = 1;
    const fadeOutDuration = 0.6;

    const totalDuration =
        startDelay / 1000 + fadeInDuration + holdDuration + fadeOutDuration;

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, totalDuration * 1000);

        return () => clearTimeout(timer);
    }, [totalDuration, onComplete]);

    return (
        <motion.p
            className="whispered-text fixed inset-0 flex items-center justify-center text-center px-6"
            style={{
                fontFamily: 'var(--font-playfair), serif',
                fontStyle: 'italic',
                fontSize: '1.5rem',
                color: 'hsl(34 30% 85%)',
                pointerEvents: 'none',
                zIndex: 10,
                filter: 'blur(0.25px)',
            }}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{
                opacity: [0, 0.15, 1, 0],
                scale: [0.985, 1, 1, 1.02],
            }}
            transition={{
                delay: startDelay / 1000,
                duration: fadeInDuration + holdDuration + fadeOutDuration,
                times: [
                    0,                                      // start
                    fadeInDuration / (fadeInDuration + holdDuration + fadeOutDuration),
                    (fadeInDuration + holdDuration) /
                    (fadeInDuration + holdDuration + fadeOutDuration),
                    1                                       // end
                ],
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            You may enter.
        </motion.p>
    );
};

export default EntranceText;
