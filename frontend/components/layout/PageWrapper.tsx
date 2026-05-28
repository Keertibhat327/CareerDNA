"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

export default function PageWrapper({
  children,
  className,
  fullWidth = false,
}: PageWrapperProps) {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("min-h-screen pt-20 pb-16", className)}
    >
      <div className={cn(fullWidth ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8")}>
        {children}
      </div>
    </motion.main>
  );
}
