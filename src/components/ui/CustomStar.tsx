"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CustomStarProps {
  className?: string;
  fill?: string;
  size?: number;
}

export function CustomStar({ className, fill = "currentColor", size = 24 }: CustomStarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-sm", className)}
      animate={{
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z"
        fill={fill}
        stroke={fill}
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="transition-colors duration-300"
      />
      {/* Small dot in the middle for 'coolness' */}
      <circle cx="12" cy="12" r="1.5" fill="white" />
    </motion.svg>
  );
}
