"use client";

import Link from "next/link";
import { Fragment, useState, type FormEvent } from "react";
import type { QuiltCopy, QuiltLocale, QuiltProduct } from "@/lib/game/content";
import type { FollowId, FollowLink } from "@/lib/game/follow";
import { trackMetaEvent } from "@/lib/meta/pixel-client";
import { StarRow } from "./QuiltIcons";
import styles from "./quiltGame.module.css";

const STARS_PER_ROUND = 3;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLAIM_ENDPOINT = "/api/game/claim";
const HTTP_BAD_REQUEST = 400;
const HTTP_TOO_MANY_REQUESTS = 429;

export interface QuiltEndScreenProps {
  readonly locale: QuiltLocale;
  readonly copy: QuiltCopy;
  readonly picks: readonly QuiltProduct[];
  readonly stars: readonly number[];
  readonly followLinks: readonly FollowLink[];
  /** Follow buttons already tapped. */
  readonly followed: readonly FollowId[];
  /** The email the code went to, once it has been sent. */
  readonly sentTo: string | null;
  readonly onFollow: (id: FollowId) => void;
  readonly onSent: (email: string) => void;
  readonly onRetry: () => void;
}

type ClaimOutcome = "sent" | "invalid_email" | "too_many_tries" | "failed";

/**
 * Asks the server to email this winner a one-time code. The code itself never
 * comes back to the browser: it only reaches the owner of the email address.
 */
async function requestCode(email: string, locale: QuiltLocale): Promise<ClaimOutcome> {
  try {
    const response = await fetch(CLAIM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consent: true, lang: locale }),
    });
    if (response.ok) return "sent";
    if (response.status === HTTP_TOO_MANY_REQUESTS) return "too_many_tries";
    if (response.status === HTTP_BAD_REQUEST) return "invalid_email";
    return "failed";
  } catch {
    // Offline or the request was cut short: the visitor can simply try again.
    return "failed";
  }
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

interface FollowStepProps {
  readonly copy: QuiltCopy;
  readonly links: readonly FollowLink[];
  readonly followed: readonly FollowId[];
  readonly onFollow: (id: FollowId) => void;
}

/**
 * "Follow us" buttons. Each opens the shop's page in a new tab and is ticked
 * once tapped. We can only see the tap, not whether the visitor followed.
 */
function FollowStep({ copy, links, followed, onFollow }: FollowStepProps) {
  if (links.length === 0) return null;
  return (
    <div className={styles.follow}>
      <div className={styles.followTitle}>{copy.followTitle}</div>
      <div className={styles.followButtons}>
        {links.map((link) => {
          const isDone = followed.includes(link.id);
          return (
            <a
              key={link.id}
              className={isDone ? `${styles.followButton} ${styles.followDone}` : styles.followButton}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onFollow(link.id)}
            >
              {link.label} <span aria-hidden="true">{isDone ? "✓" : "↗"}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

interface ClaimFormProps {
  readonly locale: QuiltLocale;
  readonly copy: QuiltCopy;
  /** False until every follow button has been tapped. */
  readonly hasFollowed: boolean;
  readonly onSent: (email: string) => void;
}

function ClaimForm({ locale, copy, hasFollowed, onSent }: ClaimFormProps) {
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messageFor: Readonly<Record<Exclude<ClaimOutcome, "sent">, string>> = {
    invalid_email: copy.invalidEmail,
    too_many_tries: copy.tooManyTries,
    failed: copy.sendFailed,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!hasFollowed) {
      setMessage(copy.followRequired);
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setMessage(copy.invalidEmail);
      return;
    }
    if (!hasConsent) {
      setMessage(copy.consentRequired);
      return;
    }
    setMessage("");
    setIsSending(true);
    const outcome = await requestCode(trimmed, locale);
    setIsSending(false);
    if (outcome !== "sent") {
      setMessage(messageFor[outcome]);
      return;
    }
    trackMetaEvent("Lead", { content_name: "quilt-game" });
    onSent(trimmed);
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

function CodeSentBox({ copy, email }: { copy: QuiltCopy; email: string }) {
  return (
    <div className={styles.codeBox} role="status">
      <div className={styles.sentTitle}>{copy.sentTitle}</div>
      <div className={styles.sentText}>{copy.sentText(email)}</div>
      <div className={styles.sentHint}>{copy.sentHint}</div>
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

export function QuiltEndScreen(props: QuiltEndScreenProps) {
  const { locale, copy, picks, stars, followLinks, followed, sentTo, onFollow, onSent, onRetry } = props;
  const hasFollowed = followLinks.every((link) => followed.includes(link.id));
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

        {sentTo ? (
          <CodeSentBox copy={copy} email={sentTo} />
        ) : (
          <>
            <FollowStep copy={copy} links={followLinks} followed={followed} onFollow={onFollow} />
            <ClaimForm locale={locale} copy={copy} hasFollowed={hasFollowed} onSent={onSent} />
          </>
        )}

        <Link className={styles.primary} href={`/${locale}/shop`}>{copy.toShop}</Link>
        <ShareButton copy={copy} totalStars={totalStars} maxStars={maxStars} />
        <button className={styles.ghost} type="button" onClick={onRetry}>{copy.retry}</button>
      </div>
    </div>
  );
}
