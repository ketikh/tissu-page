/**
 * Settings, products and texts of the quilt puzzle game ("ააწყვე ჩანთა").
 * Everything a non-developer may want to change lives in this file.
 */
import type { PuzzleProduct } from "./puzzle";

export type QuiltLocale = "ka" | "en";

/** Board size for each bag: 3 = 3×3 pieces, 4 = 4×4. For an easier game use [3, 3, 3]. */
export const QUILT_ROUNDS: readonly number[] = [3, 3, 4];

/** How many moves one hint costs. */
export const QUILT_HINT_COST = 2;

export interface QuiltProduct extends PuzzleProduct {
  readonly id: string;
  /** 900×900 JPG in /public/game. Busy backgrounds make better puzzles than plain ones. */
  readonly image: string;
  readonly name: Readonly<Record<QuiltLocale, string>>;
  readonly price: string;
}

const FLOWER_TOTE = { ka: "ყვავილის ჩანთა", en: "Flower tote" } as const;
const HEART_BAG = { ka: "გულის ჩანთა", en: "Heart bag" } as const;

export const QUILT_PRODUCTS: readonly QuiltProduct[] = [
  { id: "flower-tote-green-yellow", image: "/game/flower-tote-green-yellow.jpg", name: FLOWER_TOTE, price: "82 ₾", group: "flower", hard: true },
  { id: "flower-tote-pink-blue", image: "/game/flower-tote-pink-blue.jpg", name: FLOWER_TOTE, price: "82 ₾", group: "flower", hard: true },
  { id: "heart-bag-red-gingham", image: "/game/heart-bag-red-gingham.jpg", name: HEART_BAG, price: "65 ₾", group: "heart", hard: true },
  { id: "heart-bag-pink-leaves", image: "/game/heart-bag-pink-leaves.jpg", name: HEART_BAG, price: "65 ₾", group: "heart", hard: false },
  { id: "pair1-magenta-sideB", image: "/game/pair1-magenta-sideB.jpg", name: { ka: "ორმხრივი ლეპტოპის ქეისი", en: "Reversible laptop case" }, price: "69–74 ₾", group: "other", hard: true },
  { id: "cosmetic-bag-cactus", image: "/game/cosmetic-bag-cactus.jpg", name: { ka: "კოსმეტიკის ჩანთა", en: "Cosmetic bag" }, price: "25–35 ₾", group: "other", hard: true },
  { id: "flower-tote-red", image: "/game/flower-tote-red.jpg", name: FLOWER_TOTE, price: "82 ₾", group: "flower", hard: true },
  { id: "flower-tote-black", image: "/game/flower-tote-black.jpg", name: FLOWER_TOTE, price: "82 ₾", group: "flower", hard: true },
];

export interface QuiltCopy {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly ogTitle: string;
  readonly ogDescription: string;
  /** Start-screen title; the second part is highlighted. */
  readonly title: readonly [string, string];
  readonly intro: string;
  readonly promise: string;
  readonly rules: string;
  readonly start: string;
  readonly sample: string;
  readonly starsLabel: string;
  readonly soundLabel: string;
  readonly level: (round: number, totalRounds: number, size: number) => string;
  readonly moves: (count: number) => string;
  readonly hintButton: string;
  readonly howToMove: string;
  readonly hintActive: string;
  readonly stitched: string;
  /** End-screen title; the second part is highlighted. */
  readonly endTitle: readonly [string, string];
  readonly endText: (stars: number, maxStars: number) => string;
  readonly emailPlaceholder: string;
  readonly consent: string;
  readonly claim: string;
  readonly invalidEmail: string;
  readonly consentRequired: string;
  readonly sendFailed: string;
  readonly tooManyTries: string;
  readonly sentTitle: string;
  readonly sentText: (email: string) => string;
  readonly sentHint: string;
  readonly codeTerms: string;
  readonly toShop: string;
  readonly share: string;
  readonly linkCopied: string;
  readonly retry: string;
  readonly shareTitle: string;
  readonly shareText: (stars: number, maxStars: number) => string;
}

const KA: QuiltCopy = {
  metaTitle: "TISSU — ააწყვე ჩანთა",
  metaDescription: "ტისუს თამაში: ჩანთის ფოტო ქვილთის ნაჭრებადაა დაჭრილი — ააწყვე სამი ჩანთა და მოიგე 15%-იანი ფასდაკლება.",
  ogTitle: "TISSU — ააწყვე ჩანთა და მოიგე 15%",
  ogDescription: "სამი ჩანთა, არეული ნაჭრები, 15%-იანი კოდი. სცადე!",
  title: ["ააწყვე ", "ჩანთა"],
  intro: "ჩანთის ფოტო ქვილთის ნაჭრებადაა დაჭრილი და არეული. გადაათრიე ნაჭრები თავის ადგილზე — სწორი ნაჭერი თავისით იკერება.",
  promise: "სამი ჩანთა — და 15%-იანი კოდი შენია.",
  rules: "დრო არ გეკიდება · შეცდომა არ ისჯება · რაც ნაკლები სვლა, მით მეტი ვარსკვლავი",
  start: "დაწყება",
  sample: "ნიმუში",
  starsLabel: "ვარსკვლავები",
  soundLabel: "ხმა",
  level: (round, totalRounds, size) => `ჩანთა ${round} / ${totalRounds} · ${size}×${size}`,
  moves: (count) => `სვლა ${count}`,
  hintButton: "მინიშნება",
  howToMove: "გადაათრიე ნაჭერი, ან ორს მიყოლებით დააჭირე",
  hintActive: "ყვითელი ნაჭერი — ყვითელ ადგილზე",
  stitched: "შეკერილია ✓",
  endTitle: ["სამივე ", "ააწყვე!"],
  endText: (stars, maxStars) =>
    `${stars} / ${maxStars} ვარსკვლავი. შეიყვანე ელ-ფოსტა და მიიღე 15%-იანი კოდი — ნებისმიერ ჩანთაზე tissu.ge-ზე.`,
  emailPlaceholder: "ელ-ფოსტა",
  consent: "ვეთანხმები, რომ TISSU გამომიგზავნის შეთავაზებებს ელ-ფოსტაზე. გამოწერის გაუქმება ნებისმიერ დროს შეიძლება.",
  claim: "კოდის მიღება",
  invalidEmail: "შეიყვანე სწორი ელ-ფოსტა.",
  consentRequired: "კოდის მისაღებად საჭიროა თანხმობა.",
  sendFailed: "ვერ გაიგზავნა, სცადე ხელახლა.",
  tooManyTries: "ძალიან ბევრი მცდელობაა. სცადე ცოტა მოგვიანებით.",
  sentTitle: "კოდი გამოგზავნილია ✓",
  sentText: (email) => `შეამოწმე ${email} — შენი 15%-იანი კოდი იქ გელოდება.`,
  sentHint: "ვერ ხედავ? ნახე სპამის საქაღალდეც. ერთ მეილზე ერთი კოდი იგზავნება.",
  codeTerms: "ერთჯერადია · მოქმედებს 7 დღე",
  toShop: "მაღაზიაში →",
  share: "გაუზიარე მეგობარს",
  linkCopied: "ბმული დაკოპირდა ✓",
  retry: "კიდევ ერთხელ",
  shareTitle: "TISSU — ააწყვე ჩანთა",
  shareText: (stars, maxStars) =>
    `სამივე TISSU ჩანთა ავაწყვე (${stars}/${maxStars} ★) 🧵 სცადე შენც და მოიგე 15%:`,
};

const EN: QuiltCopy = {
  metaTitle: "TISSU — Build the bag",
  metaDescription: "The TISSU game: a bag photo is cut into quilt patches — build three bags and win a 15% discount.",
  ogTitle: "TISSU — Build the bag and win 15%",
  ogDescription: "Three bags, shuffled patches, a 15% code. Give it a try!",
  title: ["Build the ", "bag"],
  intro: "The bag photo is cut into quilt patches and shuffled. Drag each patch to its place — the right one stitches itself in.",
  promise: "Three bags — and the 15% code is yours.",
  rules: "No timer · No penalty for mistakes · Fewer moves, more stars",
  start: "Start",
  sample: "Sample",
  starsLabel: "Stars",
  soundLabel: "Sound",
  level: (round, totalRounds, size) => `Bag ${round} / ${totalRounds} · ${size}×${size}`,
  moves: (count) => `Moves ${count}`,
  hintButton: "Hint",
  howToMove: "Drag a patch, or tap two in a row",
  hintActive: "Yellow patch — to the yellow spot",
  stitched: "Stitched ✓",
  endTitle: ["All three ", "done!"],
  endText: (stars, maxStars) =>
    `${stars} / ${maxStars} stars. Enter your email and get a 15% code — for any bag on tissu.ge.`,
  emailPlaceholder: "Email",
  consent: "I agree to receive offers from TISSU by email. You can unsubscribe at any time.",
  claim: "Get the code",
  invalidEmail: "Enter a valid email.",
  consentRequired: "Consent is needed to get the code.",
  sendFailed: "Could not send, please try again.",
  tooManyTries: "Too many tries. Please try again a little later.",
  sentTitle: "Code sent ✓",
  sentText: (email) => `Check ${email} — your 15% code is waiting there.`,
  sentHint: "Can't see it? Look in your spam folder too. One code is sent per email address.",
  codeTerms: "Single use · valid for 7 days",
  toShop: "To the shop →",
  share: "Share with a friend",
  linkCopied: "Link copied ✓",
  retry: "Play again",
  shareTitle: "TISSU — Build the bag",
  shareText: (stars, maxStars) =>
    `I built all three TISSU bags (${stars}/${maxStars} ★) 🧵 Try it and win 15%:`,
};

export function getQuiltCopy(locale: string): QuiltCopy {
  return locale === "ka" ? KA : EN;
}
