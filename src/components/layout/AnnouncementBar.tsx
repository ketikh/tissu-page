"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Locale } from "@/i18n/config";

interface AnnouncementBarProps {
  lang: Locale;
  dictionary: any;
}

export function AnnouncementBar({ lang, dictionary }: AnnouncementBarProps) {
  return (
    <div className="w-full bg-brand-dark text-white overflow-hidden py-2 px-4 border-b border-white/5">
      <div className="container max-w-7xl mx-auto flex items-center justify-center">
        <motion.p 
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {dictionary.announcement.message}
        </motion.p>
      </div>
    </div>
  );
}
