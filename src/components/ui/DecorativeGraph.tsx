"use client";

import { motion } from "framer-motion";

export function DecorativeGraph() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
      <svg width="100%" height="100%" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* The Zigzag Line */}
        <motion.path
          d="M0 500L200 400L400 480L600 300L800 420L1000 250L1200 350"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* The Dots at vertices */}
        {[
          { x: 200, y: 400 },
          { x: 400, y: 480 },
          { x: 600, y: 300 },
          { x: 800, y: 420 },
          { x: 1000, y: 250 }
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r="8"
            fill="white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.2, type: "spring", stiffness: 200 }}
          />
        ))}

        {/* Second faint graph line for depth */}
        <motion.path
          d="M0 550L250 450L500 520L750 380L1000 480L1200 400"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="10 10"
          className="opacity-30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
        />
      </svg>
    </div>
  );
}
