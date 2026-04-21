"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AnimatedOrbProps {
  className?: string;
}

export function AnimatedOrb({ className = "" }: AnimatedOrbProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <motion.div
        className="w-[250px] h-[250px] md:w-[400px] md:h-[400px] relative"
        animate={
          shouldReduceMotion
            ? {}
            : { rotate: 360 }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }
        }
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="orb-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(354, 80%, 65%)" stopOpacity="0.9" />
              <stop offset="40%" stopColor="hsl(354, 80%, 57%)" stopOpacity="0.6" />
              <stop offset="70%" stopColor="hsl(340, 70%, 45%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(320, 60%, 30%)" stopOpacity="0" />
            </radialGradient>
            <filter id="orb-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
            </filter>
          </defs>
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="url(#orb-gradient)"
            filter="url(#orb-blur)"
          />
          <circle
            cx="200"
            cy="200"
            r="100"
            fill="url(#orb-gradient)"
            opacity="0.5"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(354 80% 57% / 0.15) 0%, transparent 70%)",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : { opacity: [0.6, 1, 0.6] }
        }
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />
    </div>
  );
}
