"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StickerProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  textColor?: string;
  variant?: "wavy" | "star" | "pill" | "ticket";
  rotate?: number;
}

export function Sticker({ 
  children, 
  className, 
  color = "var(--color-pink)", 
  textColor = "var(--brand-dark)",
  variant = "pill",
  rotate = 0
}: StickerProps) {
  
  const getShape = () => {
    switch (variant) {
      case "wavy":
        return "polygon(100% 50%, 94.4% 65.5%, 79.4% 75.3%, 65.5% 82.7%, 50% 100%, 34.5% 82.7%, 20.6% 75.3%, 5.6% 65.5%, 0% 50%, 5.6% 34.5%, 20.6% 24.7%, 34.5% 17.3%, 50% 0%, 65.5% 17.3%, 79.4% 24.7%, 94.4% 34.5%)";
      case "star":
        return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
      case "ticket":
        return "polygon(10% 0%, 90% 0%, 100% 20%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 0% 20%)";
      default:
        return "none";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotate: rotate - 10 }}
      whileInView={{ scale: 1, opacity: 1, rotate: rotate }}
      whileHover={{ scale: 1.1, rotate: rotate + 5, y: -5 }}
      viewport={{ once: true }}
      className={cn(
        "sticker-shadow inline-flex items-center justify-center px-6 py-3 font-bold uppercase tracking-widest text-[10px] sm:text-xs",
        variant === "pill" ? "rounded-full" : "",
        className
      )}
      style={{ 
        backgroundColor: color, 
        color: textColor,
        clipPath: getShape(),
        transform: `rotate(${rotate}deg)`
      }}
    >
      <span className="relative z-10">{children}</span>
    </motion.div>
  );
}
