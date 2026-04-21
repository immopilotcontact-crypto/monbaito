"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEyebrow({ children, className = "" }: SectionEyebrowProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className={`eyebrow inline-block mb-4 ${className}`}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.span>
  );
}
