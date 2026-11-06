"use client";

import {
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { RoundState } from "@/lib/game/puzzle";
import { StitchMark } from "./QuiltIcons";
import styles from "./quiltGame.module.css";

/** A press that moves further than this is a drag; anything shorter is a tap. */
const DRAG_THRESHOLD_PX = 7;

interface PressState {
  readonly piece: number;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  /** Where inside the piece the finger landed, so the piece does not jump under it. */
  readonly offsetX: number;
  readonly offsetY: number;
  readonly isDragging: boolean;
}

interface DragPosition {
  readonly piece: number;
  readonly x: number;
  readonly y: number;
}

export interface QuiltHint {
  readonly pieces: readonly number[];
  /** Changes on every hint so the pulse animation restarts. */
  readonly nonce: number;
}

export interface QuiltBoardProps {
  readonly image: string;
  readonly round: RoundState;
  readonly selected: number | null;
  readonly hint: QuiltHint | null;
  readonly isSolved: boolean;
  readonly animateIn: boolean;
  readonly isDisabled: boolean;
  readonly frameRef: RefObject<HTMLDivElement | null>;
  readonly fxRef: RefObject<HTMLDivElement | null>;
  readonly toast: ReactNode;
  readonly isToastShown: boolean;
  readonly onSelect: (piece: number | null) => void;
  readonly onSwap: (slotA: number, slotB: number) => void;
  readonly onPickUp: () => void;
  readonly onHintEnd: () => void;
}

function classNames(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function slotTransform(slot: number, size: number): string {
  return `translate(${(slot % size) * 100}%, ${Math.floor(slot / size) * 100}%)`;
}

/** Shows the part of the photo that belongs to `piece`. */
function patchStyle(image: string, piece: number, size: number): CSSProperties {
  const row = Math.floor(piece / size);
  const col = piece % size;
  const steps = Math.max(1, size - 1);
  return {
    backgroundImage: `url("${image}")`,
    backgroundSize: `${size * 100}% ${size * 100}%`,
    backgroundPosition: `${(col / steps) * 100}% ${(row / steps) * 100}%`,
  };
}

function QuiltRing({ isSolved }: { isSolved: boolean }) {
  const shadowId = `quilt-ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const outline = { x: -7, y: -7, width: 114, height: 114, rx: 30, fill: "none" } as const;
  return (
    <svg className={styles.ring} viewBox="-14 -14 128 128" aria-hidden="true">
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#205348" floodOpacity=".18" />
        </filter>
      </defs>
      <rect {...outline} stroke="var(--q-pink)" strokeWidth="8" filter={`url(#${shadowId})`} />
      <rect {...outline} stroke="var(--q-green)" strokeWidth="1.1" strokeDasharray="2.4 2.4" strokeLinecap="round" opacity=".55" />
      <rect
        {...outline}
        className={classNames(styles.ringDone, isSolved && styles.ringDoneOn)}
        stroke="var(--q-hot)" strokeWidth="2.1" strokeDasharray="3 2.2" strokeLinecap="round"
      />
    </svg>
  );
}

export function QuiltBoard({
  image, round, selected, hint, isSolved, animateIn, isDisabled, frameRef, fxRef,
  toast, isToastShown, onSelect, onSwap, onPickUp, onHintEnd,
}: QuiltBoardProps) {
  const { size, perm } = round;
  const boardRef = useRef<HTMLDivElement | null>(null);
  const pressRef = useRef<PressState | null>(null);
  const [drag, setDrag] = useState<DragPosition | null>(null);
  const [wobbling, setWobbling] = useState<number | null>(null);

  const slotAt = (clientX: number, clientY: number): number | null => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    const x = clamp(clientX - rect.left, 0, rect.width - 1);
    const y = clamp(clientY - rect.top, 0, rect.height - 1);
    return Math.floor(y / (rect.height / size)) * size + Math.floor(x / (rect.width / size));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>, piece: number, isStitched: boolean) => {
    if (isDisabled || pressRef.current) return;
    if (isStitched) {
      setWobbling(piece);
      return;
    }
    event.preventDefault();
    try {
      // Keeps the drag alive when the finger slides off the piece.
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone (lifted mid-press); tapping still works without capture.
    }
    const rect = event.currentTarget.getBoundingClientRect();
    pressRef.current = {
      piece,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      isDragging: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    if (!press.isDragging) {
      const distance = Math.hypot(event.clientX - press.startX, event.clientY - press.startY);
      if (distance <= DRAG_THRESHOLD_PX) return;
      pressRef.current = { ...press, isDragging: true };
      onSelect(null);
      onPickUp();
    }
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDrag({
      piece: press.piece,
      x: event.clientX - rect.left - press.offsetX,
      y: event.clientY - rect.top - press.offsetY,
    });
  };

  const handleTap = (piece: number) => {
    if (selected === piece) {
      onSelect(null);
    } else if (selected !== null) {
      onSelect(null);
      onSwap(perm.indexOf(selected), perm.indexOf(piece));
    } else {
      onSelect(piece);
      onPickUp();
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press || event.pointerId !== press.pointerId) return;
    pressRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!press.isDragging) {
      handleTap(press.piece);
      return;
    }
    setDrag(null);
    const target = slotAt(event.clientX, event.clientY);
    if (target !== null) onSwap(perm.indexOf(press.piece), target);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pressRef.current?.pointerId !== event.pointerId) return;
    pressRef.current = null;
    setDrag(null);
  };

  // The wobble plays on the piece itself, the hint pulse on the patch inside it.
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setWobbling(null);
    else onHintEnd();
  };

  const cell = `${100 / size}%`;
  const pieces = perm.map((_, piece) => {
    const slot = perm.indexOf(piece);
    const home = slotTransform(slot, size);
    const isStitched = slot === piece;
    const isDragged = drag?.piece === piece;
    const isHinted = hint?.pieces.includes(piece) ?? false;
    const pieceStyle = {
      width: cell,
      height: cell,
      transform: isDragged ? `translate(${drag.x}px, ${drag.y}px)` : home,
      "--q-home": home,
    } as CSSProperties;
    return (
      <div
        key={piece}
        className={classNames(
          styles.piece,
          isStitched && styles.stitched,
          selected === piece && styles.selected,
          isDragged && styles.dragging,
          isHinted && styles.hinted,
          wobbling === piece && styles.wobble,
        )}
        style={pieceStyle}
        onPointerDown={(event) => handlePointerDown(event, piece, isStitched)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          key={isHinted && hint ? `hint-${hint.nonce}` : "patch"}
          className={styles.patch}
          style={patchStyle(image, piece, size)}
        >
          {isStitched && <span className={styles.mark}><StitchMark /></span>}
        </div>
      </div>
    );
  });

  return (
    <div
      ref={frameRef}
      className={classNames(styles.frame, isSolved && styles.pulse, animateIn && !isSolved && styles.swapIn)}
    >
      <QuiltRing isSolved={isSolved} />
      <div
        ref={boardRef}
        className={classNames(styles.board, isSolved && styles.done)}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onSelect(null);
        }}
      >
        {pieces}
      </div>
      <div ref={fxRef} className={styles.fx} aria-hidden="true" />
      <div className={classNames(styles.toast, isToastShown && styles.toastShown)} role="status">
        {toast}
      </div>
    </div>
  );
}
