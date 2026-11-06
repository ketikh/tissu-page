/** Small inline drawings used by the quilt game. */

const STAR_PATH = "M12 2l2.2 6.8H21l-5.6 4 2.2 6.8L12 15.5 6.4 19.6l2.2-6.8L3 8.8h6.8z";
const STAR_YELLOW = "#F8BF27";

export function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {filled ? (
        <path d={STAR_PATH} fill={STAR_YELLOW} />
      ) : (
        <path d={STAR_PATH} fill="none" stroke={STAR_YELLOW} strokeWidth="1.6" />
      )}
    </svg>
  );
}

/** Row of earned stars followed by empty ones, e.g. ★★☆ for 2 of 3. */
export function StarRow({ earned, total }: { earned: number; total: number }) {
  return (
    <>
      {Array.from({ length: total }, (_, index) => (
        <StarIcon key={index} filled={index < earned} />
      ))}
    </>
  );
}

export function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      {muted ? (
        <>
          <path d="m22 9-6 6" />
          <path d="m16 9 6 6" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      )}
    </svg>
  );
}

/** The little cross-stitch that marks a patch as sewn in place. */
export function StitchMark() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true">
      <g stroke="#fff" strokeWidth="3.2" strokeLinecap="round">
        <path d="M3 3l8 8M11 3l-8 8" />
      </g>
      <g stroke="#F50065" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 3l8 8M11 3l-8 8" />
      </g>
    </svg>
  );
}

export function SparkleDeco({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 30" fill="none" stroke={STAR_YELLOW} strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M15 3v24M3 15h24M6.5 6.5l17 17M23.5 6.5l-17 17" />
    </svg>
  );
}

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 14" fill="none" stroke="#F50065" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M2 7c6-8 12 8 18 0s12-8 18 0 12 8 18 0 12-8 18 0 12 8 18 0 12-8 18 0" />
    </svg>
  );
}
