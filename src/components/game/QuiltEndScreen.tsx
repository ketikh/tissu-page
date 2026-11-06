"use client";

import Link from "next/link";
import { Fragment, useState, type FormEvent } from "react";
import type { QuiltCopy, QuiltLocale, QuiltProduct } from "@/lib/game/content";
import { trackMetaEvent } from "@/lib/meta/pixel-client";
import { StarRow } from "./QuiltIcons";
import styles from "./quiltGame.module.css";

const STARS_PER_ROUND = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface QuiltEndScreenProps {
  readonly locale: QuiltLocale;
  readonly copy: QuiltCopy;
  readonly picks: readonly QuiltProduct[];
  readonly stars: readonly number[];
  readonly promoCode: string;
  /** Where winners' emails are posted. Null means emails are not stored anywhere. */
  readonly submitUrl: string | null;
  readonly onRetry: () => void;
}

/** Posts the winner's email to the configured collector (Mailchimp, a form, …). */
async function submitEmail(submitUrl: string, email: string, stars: readonly number[]): Promise<void> {
  await fetch(submitUrl, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams({ email, stars: stars.join(""), source: "quilt-game" }),
  });
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard access can be denied; the caller shows a fallback.
    return false;
  }
}

interface ClaimFormProps {
  readonly copy: QuiltCopy;
  readonly stars: readonly number[];
  readonly submitUrl: string | null;
  readonly onClaimed: () => void;
}

function ClaimForm({ copy, stars, submitUrl, onClaimed }: ClaimFormProps) {
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) return setMessage(copy.invalidEmail);
    if (!hasConsent) return setMessage(copy.consentRequired);
    setMessage("");
    setIsSending(true);
    try {
      if (submitUrl) await submitEmail(submitUrl, trimmed, stars);
      trackMetaEvent("Lead", { content_name: "quilt-game" });
      onClaimed();
    } catch {
      setMessage(copy.sendFailed);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        className={styles.email}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={copy.emailPlaceholder}
        aria-label={copy.emailPlaceholder}
        autoComplete="email"
        inputMode="email"
        maxLength={254}
      />
      <label className={styles.consent}>
        <input type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} />
        <span>{copy.consent}</span>
      </label>
      <button className={`${styles.primary} ${styles.primaryHot}`} type="submit" disabled={isSending}>
        {copy.claim}
      </button>
      <div className={styles.message} role="alert">{message}</div>
    </form>
  );
}

function PromoCodeBox({ copy, promoCode }: { copy: QuiltCopy; promoCode: string }) {
  const [copyLabel, setCopyLabel] = useState(copy.copyCode);
  const handleCopy = async () => {
    setCopyLabel((await copyText(promoCode)) ? copy.codeCopied : copy.copyByHand);
  };
  return (
    <div className={styles.codeBox}>
      <div className={styles.codeLabel}>{copy.codeLabel}</div>
      <div className={styles.code}>{promoCode}</div>
      <button className={styles.copyButton} type="button" onClick={handleCopy}>{copyLabel}</button>
      <div className={styles.codeTerms}>{copy.codeTerms}</div>
    </div>
  );
}

function ShareButton({ copy, totalStars, maxStars }: { copy: QuiltCopy; totalStars: number; maxStars: number }) {
  const [label, setLabel] = useState(copy.share);
  const handleShare = async () => {
    const url = window.location.href;
    const text = copy.shareText(totalStars, maxStars);
    try {
      await navigator.share({ title: copy.shareTitle, text, url });
    } catch {
      // No share sheet (desktop) or the visitor closed it: copy the link instead.
      setLabel((await copyText(`${text} ${url}`)) ? copy.linkCopied : url);
    }
  };
  return <button className={styles.ghost} type="button" onClick={handleShare}>{label}</button>;
}

export function QuiltEndScreen({ locale, copy, picks, stars, promoCode, submitUrl, onRetry }: QuiltEndScreenProps) {
  const [isClaimed, setIsClaimed] = useState(false);
  const totalStars = stars.reduce((sum, earned) => sum + earned, 0);
  const maxStars = stars.length * STARS_PER_ROUND;

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h1 className={styles.cardTitle}>
          {copy.endTitle[0]}
          <span className={styles.hot}>{copy.endTitle[1]}</span>
        </h1>
        <div className={styles.bigStars}>
          {stars.map((earned, round) => (
            <Fragment key={round}>
              {round > 0 && <span className={styles.starGap} />}
              <StarRow earned={earned} total={STARS_PER_ROUND} />
            </Fragment>
          ))}
        </div>
        <p>{copy.endText(totalStars, maxStars)}</p>
        <div className={styles.quiltRow}>
          {picks.map((product) => (
            // eslint-disable-next-line @next/next/no-img-element -- same file the board already loaded
            <img key={product.id} src={product.image} alt={product.name[locale]} />
          ))}
        </div>

        {isClaimed ? (
          <PromoCodeBox copy={copy} promoCode={promoCode} />
        ) : (
          <ClaimForm copy={copy} stars={stars} submitUrl={submitUrl} onClaimed={() => setIsClaimed(true)} />
        )}

        <Link className={styles.primary} href={`/${locale}/shop`}>{copy.toShop}</Link>
        <ShareButton copy={copy} totalStars={totalStars} maxStars={maxStars} />
        <button className={styles.ghost} type="button" onClick={onRetry}>{copy.retry}</button>
      </div>
    </div>
  );
}
