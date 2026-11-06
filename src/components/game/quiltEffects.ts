"use client";

/**
 * Sound, vibration and confetti for the quilt game. All of it is decoration:
 * if the browser blocks any of it, the game carries on silently.
 */
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import styles from "./quiltGame.module.css";

// ---------------------------------------------------------------- mute setting

const MUTE_STORAGE_KEY = "tissu-mute";
const MUTE_CHANGE_EVENT = "tissu-mute-change";

/** Used when the browser refuses access to localStorage (e.g. private mode). */
let mutedInMemory = false;

function readMuted(): boolean {
  try {
    const stored = window.localStorage.getItem(MUTE_STORAGE_KEY);
    if (stored !== null) return stored === "1";
  } catch {
    // Storage is blocked: fall back to the in-memory value below.
  }
  return mutedInMemory;
}

function writeMuted(muted: boolean): void {
  mutedInMemory = muted;
  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // Storage is blocked: the choice still applies until the page is closed.
  }
  window.dispatchEvent(new Event(MUTE_CHANGE_EVENT));
}

function subscribeToMute(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(MUTE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(MUTE_CHANGE_EVENT, onChange);
  };
}

// ---------------------------------------------------------------------- sounds

interface Tone {
  readonly freq: number;
  readonly duration: number;
  readonly type?: OscillatorType;
  readonly gain?: number;
  readonly delay?: number;
}

export type SoundName = "pick" | "swap" | "snap" | "done" | "win";

const SOUNDS: Readonly<Record<SoundName, readonly Tone[]>> = {
  pick: [{ freq: 520, duration: 0.05, gain: 0.04 }],
  swap: [{ freq: 420, duration: 0.06, type: "triangle", gain: 0.04 }],
  snap: [
    { freq: 880, duration: 0.08 },
    { freq: 1320, duration: 0.1, gain: 0.05, delay: 0.05 },
  ],
  done: [660, 880, 1100, 1320].map((freq, step) => ({ freq, duration: 0.13, delay: step * 0.08 })),
  win: [523, 659, 784, 1047, 1319].map((freq, step) => ({
    freq, duration: 0.18, type: "triangle" as const, gain: 0.08, delay: step * 0.1,
  })),
};

const DEFAULT_GAIN = 0.07;
const SILENT = 0.0001;

function createAudioContext(): AudioContext | null {
  const Ctor = window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

function playTone(context: AudioContext, tone: Tone): void {
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const start = context.currentTime + (tone.delay ?? 0);
  oscillator.type = tone.type ?? "sine";
  oscillator.frequency.value = tone.freq;
  volume.gain.setValueAtTime(SILENT, start);
  volume.gain.exponentialRampToValueAtTime(tone.gain ?? DEFAULT_GAIN, start + 0.01);
  volume.gain.exponentialRampToValueAtTime(SILENT, start + tone.duration);
  oscillator.connect(volume).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + tone.duration + 0.02);
}

export interface QuiltSound {
  readonly muted: boolean;
  readonly toggleMute: () => void;
  /** Call from a tap or click: browsers only allow sound after a user gesture. */
  readonly unlock: () => void;
  readonly play: (name: SoundName) => void;
  readonly vibrate: (pattern: number | number[]) => void;
}

export function useQuiltSound(): QuiltSound {
  const muted = useSyncExternalStore(subscribeToMute, readMuted, () => false);
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback((): AudioContext | null => {
    if (!contextRef.current) contextRef.current = createAudioContext();
    return contextRef.current;
  }, []);

  useEffect(() => () => {
    void contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
  }, []);

  const unlock = useCallback(() => {
    try {
      void getContext()?.resume().catch(() => undefined);
    } catch {
      // No audio support: the game simply stays silent.
    }
  }, [getContext]);

  const play = useCallback((name: SoundName) => {
    if (readMuted()) return;
    try {
      const context = getContext();
      if (context) SOUNDS[name].forEach((tone) => playTone(context, tone));
    } catch {
      // No audio support: the game simply stays silent.
    }
  }, [getContext]);

  const vibrate = useCallback((pattern: number | number[]) => {
    try {
      navigator.vibrate?.(pattern);
    } catch {
      // Vibration is optional and unsupported on many devices.
    }
  }, []);

  const toggleMute = useCallback(() => writeMuted(!readMuted()), []);

  return { muted, toggleMute, unlock, play, vibrate };
}

// -------------------------------------------------------------------- confetti

const PARTICLE_LIFETIME_MS = 850;

/** Fixed, hand-written drawings (no user input), so innerHTML is safe here. */
const DOODLES: readonly string[] = [
  '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3 4.5 6.6 4.5c2 0 3.6 1.1 4.4 2.5.8-1.4 2.4-2.5 4.4-2.5 3.6 0 5.7 3.5 4.2 7.1C19.5 16.4 12 21 12 21z" fill="#F50065"/></svg>',
  '<svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.8H21l-5.6 4 2.2 6.8L12 15.5 6.4 19.6l2.2-6.8L3 8.8h6.8z" fill="#F8BF27"/></svg>',
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="#F8BF27"/><g fill="#F50065"><circle cx="12" cy="5" r="3"/><circle cx="12" cy="19" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/></g></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="#3D7C5F" stroke-width="3" stroke-linecap="round"><path d="M12 3v18M3 12h18"/></svg>',
  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="#9CC26D"/></svg>',
];

/** Throws `count` little doodles out from the point (x, y) inside `layer`. */
export function spawnBurst(layer: HTMLElement | null, x: number, y: number, count: number): void {
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let index = 0; index < count; index++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 44;
    const particle = document.createElement("div");
    particle.className = styles.particle;
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--rot", `${Math.random() * 200 - 100}deg`);
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.innerHTML = DOODLES[Math.floor(Math.random() * DOODLES.length)];
    layer.appendChild(particle);
    window.setTimeout(() => particle.remove(), PARTICLE_LIFETIME_MS);
  }
}
