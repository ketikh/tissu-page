"use client";

import { use } from "react";
import { Locale } from "@/i18n/config";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = lang as Locale;
  const isKa = locale === "ka";

  return (
    <div className="bg-[var(--tissu-cream)]">
      <div className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">
          {/* Info Side */}
          <div className="space-y-10">
            <div>
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--tissu-white)] border border-[var(--border)] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--tissu-ink-soft)]">
                <span className="w-2 h-2 rounded-full bg-[var(--tissu-mustard)]" />
                {isKa ? "მოგვწერე" : "Get in touch"}
              </span>
              <h1 className="ka-display-xl font-serif text-[44px] sm:text-[60px] md:text-[74px] leading-[1] tracking-[-0.02em] mt-6 mb-5 text-[var(--tissu-ink)]">
                {isKa ? (
                  <>
                    გვიამბე {""}
                    <em className="not-italic italic text-[var(--tissu-terracotta)]">შენი</em>{" "}
                    ამბავი.
                  </>
                ) : (
                  <>
                    Tell us {""}
                    <em className="not-italic italic text-[var(--tissu-terracotta)]">your</em>{" "}
                    story.
                  </>
                )}
              </h1>
              <p className="text-[17px] leading-[1.6] text-[var(--tissu-ink-soft)] max-w-[540px]">
                {isKa
                  ? "შეკითხვა გაქვს, სურვილი, თუ უბრალოდ მოსალმება — მოგვწერე. ჩვენ ხელით ვპასუხობთ, ყველა მეილს 1-2 დღეში."
                  : "A question, a wish, or just a hello — drop us a line. We reply to every note by hand, usually within a day or two."}
              </p>
            </div>

            <div className="space-y-4">
              <ContactRow
                icon={<Mail className="w-5 h-5" />}
                label={isKa ? "ელფოსტა" : "Email"}
                value="hello@tissu.ge"
                href="mailto:hello@tissu.ge"
              />
              <ContactRow
                icon={<Phone className="w-5 h-5" />}
                label={isKa ? "ტელეფონი" : "Phone"}
                value="+995 555 12 34 56"
                href="tel:+995555123456"
              />
              <ContactRow
                icon={<MapPin className="w-5 h-5" />}
                label={isKa ? "სტუდია" : "Studio"}
                value={isKa ? "თბილისი, საქართველო" : "Tbilisi, Georgia"}
              />
            </div>

            <div className="rounded-[28px] bg-[var(--tissu-cobalt)] text-[var(--tissu-cream)] p-6 md:p-8">
              <div className="font-serif text-[22px] mb-2">
                {isKa ? "საბითუმო ან თანამშრომლობა?" : "Wholesale or a collab?"}
              </div>
              <p className="text-[14px] leading-[1.6] opacity-90">
                {isKa
                  ? "მოგვწერე ელფოსტაზე პროექტის აღწერით, ვუპასუხებთ რამდენიმე დღეში."
                  : "Email us with a short brief and we'll get back to you in a few days."}
              </p>
            </div>
          </div>

          {/* Form Side */}
          <form
            className="rounded-[28px] bg-[var(--tissu-white)] border border-[var(--border)] p-6 md:p-10 space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--tissu-ink-soft)]">
                {isKa ? "სახელი" : "Name"}
              </label>
              <input
                type="text"
                required
                placeholder={isKa ? "შენი სახელი" : "Your name"}
                className="px-5 py-3.5 rounded-full bg-[var(--tissu-cream)] border border-[var(--border)] text-[15px] text-[var(--tissu-ink)] outline-none focus:border-[var(--tissu-ink)] placeholder:text-[var(--tissu-ink-soft)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--tissu-ink-soft)]">
                {isKa ? "ელფოსტა" : "Email"}
              </label>
              <input
                type="email"
                required
                placeholder="you@lovely.com"
                className="px-5 py-3.5 rounded-full bg-[var(--tissu-cream)] border border-[var(--border)] text-[15px] text-[var(--tissu-ink)] outline-none focus:border-[var(--tissu-ink)] placeholder:text-[var(--tissu-ink-soft)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--tissu-ink-soft)]">
                {isKa ? "თემა" : "Topic"}
              </label>
              <select className="px-5 py-3.5 rounded-full bg-[var(--tissu-cream)] border border-[var(--border)] text-[15px] text-[var(--tissu-ink)] outline-none focus:border-[var(--tissu-ink)]">
                <option>{isKa ? "შეკითხვა" : "A question"}</option>
                <option>{isKa ? "შეკვეთა / ყელსაბამი" : "Custom necklace order"}</option>
                <option>{isKa ? "საბითუმო" : "Wholesale"}</option>
                <option>{isKa ? "თანამშრომლობა" : "Collaboration"}</option>
                <option>{isKa ? "სხვა" : "Something else"}</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold uppercase tracking-[0.15em] text-[var(--tissu-ink-soft)]">
                {isKa ? "წერილი" : "Message"}
              </label>
              <textarea
                required
                rows={6}
                placeholder={isKa ? "მოგვიყევი..." : "Tell us everything..."}
                className="px-5 py-4 rounded-[22px] bg-[var(--tissu-cream)] border border-[var(--border)] text-[15px] text-[var(--tissu-ink)] outline-none focus:border-[var(--tissu-ink)] placeholder:text-[var(--tissu-ink-soft)] resize-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2.5 bg-[var(--tissu-ink)] text-[var(--tissu-cream)] px-7 py-4 rounded-full font-extrabold text-[15px] tracking-[0.02em] shadow-[0_6px_0_var(--tissu-terracotta)] hover:translate-y-[3px] hover:shadow-[0_3px_0_var(--tissu-terracotta)] transition-[transform,box-shadow] duration-200"
            >
              {isKa ? "გაგზავნა" : "Send message"}
              <Send className="w-4 h-4" />
            </button>
            <p className="text-[12px] text-[var(--tissu-ink-soft)] leading-relaxed">
              {isKa
                ? "მეილში ვპასუხობთ ხელით — 1-2 დღე."
                : "We reply to every note by hand — usually within 1-2 days."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-[20px] bg-[var(--tissu-white)] border border-[var(--border)] px-5 py-4 hover:border-[var(--tissu-ink)] transition-colors">
      <div className="w-11 h-11 rounded-full bg-[var(--tissu-cream)] text-[var(--tissu-terracotta)] inline-flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--tissu-ink-soft)]">
          {label}
        </div>
        <div className="font-serif text-[20px] text-[var(--tissu-ink)] leading-tight">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}
