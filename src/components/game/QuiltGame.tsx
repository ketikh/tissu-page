"use client";

import { useEffect, useRef } from "react";
import { QUILT_PRODUCTS, QUILT_ROUNDS, getQuiltCopy, type QuiltCopy, type QuiltLocale } from "@/lib/game/content";
import { QuiltBoard } from "./QuiltBoard";
import { QuiltEndScreen } from "./QuiltEndScreen";
import { SoundIcon, SparkleDeco, Squiggle, StarIcon, StarRow } from "./QuiltIcons";
import { useQuiltGame, type QuiltToast } from "./useQuiltGame";
import styles from "./quiltGame.module.css";

export interface QuiltGameProps {
  readonly locale: QuiltLocale;
  readonly promoCode: string;
  /** Where winners' emails are posted. Null means emails are not stored anywhere. */
  readonly submitUrl: string | null;
}

/** Scrambled 3×3 preview on the start card: the photo position of each little patch. */
const DEMO_PATCHES: readonly string[] = [
  "100% 0", "0 50%", "50% 100%",
  "0 0", "50% 50%", "100% 100%",
  "100% 50%", "0 100%", "50% 0",
];

/**
 * Tells the stylesheet how far down the page the game starts (the navbar's
 * height), so the game can fill exactly the rest of the screen.
 */
function useTopOffset() {
  const rootRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => {
      const offset = Math.round(root.getBoundingClientRect().top + window.scrollY);
      root.style.setProperty("--q-offset", `${offset}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return rootRef;
}

function IntroCard({ copy, onStart }: { copy: QuiltCopy; onStart: () => void }) {
  const demoImage = `url("${QUILT_PRODUCTS[0].image}")`;
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <SparkleDeco className={styles.deco} />
        <h1 className={styles.cardTitle}>
          {copy.title[0]}
          <span className={styles.hot}>{copy.title[1]}</span>
        </h1>
        <Squiggle className={styles.squiggle} />
        <div className={styles.demo} aria-hidden="true">
          {DEMO_PATCHES.map((position) => (
            <span key={position} className={styles.demoPatch} style={{ backgroundImage: demoImage, backgroundPosition: position }} />
          ))}
        </div>
        <p>{copy.intro}</p>
        <p><b>{copy.promise}</b></p>
        <p className={styles.small}>{copy.rules}</p>
        <button className={`${styles.primary} ${styles.primaryHot}`} type="button" onClick={onStart}>
          {copy.start}
        </button>
      </div>
    </div>
  );
}

function ToastContent({ toast, copy, locale }: { toast: QuiltToast | null; copy: QuiltCopy; locale: QuiltLocale }) {
  if (!toast) return null;
  return (
    <>
      {copy.stitched}
      <small className={styles.toastDetail}>
        {toast.product.name[locale]} · {toast.product.price} · <StarRow earned={toast.stars} total={toast.stars} />
      </small>
    </>
  );
}

export function QuiltGame({ locale, promoCode, submitUrl }: QuiltGameProps) {
  const copy = getQuiltCopy(locale);
  const game = useQuiltGame();
  const rootRef = useTopOffset();
  const { product, round, sound } = game;

  return (
    <section ref={rootRef} className={styles.root}>
      <div className={styles.app}>
        <div className={styles.hud}>
          <div className={styles.stars} role="img" aria-label={`${copy.starsLabel}: ${game.stars.length} / ${QUILT_ROUNDS.length}`}>
            {QUILT_ROUNDS.map((_, index) => (
              <StarIcon key={index} filled={(game.stars[index] ?? 0) > 0} />
            ))}
          </div>
          <button className={styles.iconButton} type="button" onClick={sound.toggleMute} aria-label={copy.soundLabel} aria-pressed={!sound.muted}>
            <SoundIcon muted={sound.muted} />
          </button>
        </div>

        <div className={styles.stage}>
          <div className={styles.meta}>
            <div className={styles.thumbWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element -- same file the board already loaded */}
              <img className={styles.thumb} src={product.image} alt={copy.sample} />
              <span className={styles.thumbLabel}>{copy.sample}</span>
            </div>
            <div className={styles.metaText}>
              <div className={styles.level}>{copy.level(game.roundIndex + 1, QUILT_ROUNDS.length, round.size)}</div>
              <h2 className={styles.productName}>{product.name[locale]}</h2>
              <span className={styles.price}>{product.price}</span>
            </div>
          </div>

          <QuiltBoard
            key={game.boardKey}
            image={product.image}
            round={round}
            selected={game.selected}
            hint={game.hint}
            isSolved={game.isSolved}
            animateIn={game.roundIndex > 0}
            isDisabled={game.phase !== "playing" || game.isSolved}
            frameRef={game.frameRef}
            fxRef={game.fxRef}
            toast={<ToastContent toast={game.toast} copy={copy} locale={locale} />}
            isToastShown={game.isToastShown}
            onSelect={game.select}
            onSwap={game.swap}
            onPickUp={() => sound.play("pick")}
            onHintEnd={game.clearHint}
          />

          <div className={styles.sub}>
            <div className={styles.moves}>{copy.moves(round.moves)}</div>
            <button className={styles.hintButton} type="button" onClick={game.showHint} disabled={game.isSolved}>
              {copy.hintButton}
            </button>
          </div>
          <p className={styles.howTo}>{game.isHintTextShown ? copy.hintActive : copy.howToMove}</p>
        </div>

        {game.phase === "intro" && <IntroCard copy={copy} onStart={game.startGame} />}
        {game.phase === "won" && (
          <QuiltEndScreen
            locale={locale}
            copy={copy}
            picks={game.picks}
            stars={game.stars}
            promoCode={promoCode}
            submitUrl={submitUrl}
            onRetry={game.startGame}
          />
        )}
      </div>
    </section>
  );
}
