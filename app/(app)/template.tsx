"use client";

import { motion } from "motion/react";

/** Re-mounts on every navigation: a short iOS-like slide + fade in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
    >
      {children}
    </motion.div>
  );
}
