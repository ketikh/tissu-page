"use client";

import { Locale } from "@/i18n/config";

interface AnnouncementBarProps {
  lang: Locale;
  dictionary: any;
}

export function AnnouncementBar({ lang }: AnnouncementBarProps) {
  const phrases =
    lang === "ka"
      ? [
          "ხელით ნაკერი სიყვარულით",
          "უფასო მიწოდება 150₾-ზე მეტ შეკვეთაზე",
          "100% ბამბა",
          "დამზადებულია თბილისში",
          "საგაზაფხულო კოლექცია უკვე გამოვიდა",
        ]
      : [
          "handmade with love",
          "free shipping over 150₾",
          "100% cotton",
          "made in tbilisi",
          "new spring drop is here",
        ];

  // Repeat the track twice so the translateX(-50%) loop reads seamless.
  const track = [...phrases, ...phrases];

  return (
    <div className="w-full overflow-hidden bg-[var(--tissu-terracotta)] text-[var(--tissu-cream)]">
      <div className="flex whitespace-nowrap animate-marquee py-3.5 text-[13px] font-bold uppercase tracking-[0.1em]">
        {track.map((phrase, i) => (
          <span key={i} className="inline-flex items-center gap-10 px-5">
            {phrase}
            <span
              aria-hidden="true"
              className="inline-block w-[10px] h-[10px] rounded-full bg-[var(--tissu-mustard)]"
            />
          </span>
        ))}
      </div>
    </div>
  );
}
