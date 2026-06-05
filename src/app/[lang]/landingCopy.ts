// Single source of truth for landing page copy.
// Georgian copy is native craft — it does not literally mirror the English.
// Product facts: reversible (two-sided), water-resistant canvas, handmade in Tbilisi since 2023.

import type { Locale } from "@/i18n/config";

export interface LandingCopy {
  marquee: string[];
  nav: { shop: string; story: string; process: string; journal: string };
  hero: {
    eyebrow: string;
    titlePart1: string;
    titleItalic: string;
    titlePart2: string;
    titleSquiggle: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    socialProof: string;
    tagCanvas: string;
    tagReversible: string;
    imageAltBlue: string;
    imageAltYellow: string;
    imageAltStriped: string;
  };
  shop: {
    titlePart1: string;
    titleItalic: string;
    titlePart2: string;
    sub: string;
    filters: {
      all: string;
      pouch: string;
      laptop: string;
      bag: string;
      kidsbackpack: string;
      apron: string;
      necklace: string;
      new: string;
    };
    card: { favourite: string; addToBasket: string };
    badges: { new: string; bestseller: string; limited: string };
  };
  products: Array<{ name: string; sub: string }>;
  story: {
    eyebrow: string;
    titlePart1: string;
    titleItalic: string;
    titlePart2: string;
    body: string;
    stats: Array<{ num: string; label: string }>;
    sinceLine1: string;
    sinceLine2: string;
  };
  process: {
    titlePart1: string;
    titleItalic: string;
    titlePart2: string;
    sub: string;
    steps: Array<{ title: string; body: string }>;
  };
  picker: {
    eyebrow: string;
    titlePart1: string;
    titleItalic: string;
    titlePart2: string;
    body: string;
    cta: string;
    shipsNote: string;
    altPreview: string;
  };
  reviews: {
    titlePart1: string;
    titleItalic: string;
    titlePart2: string;
    sub: string;
    items: Array<{ text: string; meta: string; name: string }>;
  };
  ig: {
    titlePart1: string;
    titleItalic: string;
    sub: string;
    tiles: Array<{ line1: string; line2: string; likes?: string }>;
  };
  newsletter: {
    titlePart1: string;
    titleItalic: string;
    titlePart2: string;
    body: string;
    placeholder: string;
    cta: string;
  };
  footer: {
    tagline: string;
    cols: { shop: string; care: string; studio: string };
    shopLinks: string[];
    careLinks: string[];
    studioLinks: string[];
    copyrightSuffix: string;
  };
}

const en: LandingCopy = {
  marquee: [
    "free shipping over 150₾",
    "a splash of color, every day.",
    "handmade in tbilisi",
    "made with love",
  ],
  nav: { shop: "Shop", story: "Our story", process: "How it's made", journal: "Journal" },
  hero: {
    eyebrow: "New collection · Spring '26",
    titlePart1: "A splash of",
    titleItalic: "",
    titlePart2: "color, every day.",
    titleSquiggle: "No compromises",
    lead: "Designed and made in Georgia.",
    ctaPrimary: "See the collection",
    ctaSecondary: "Browse both sides",
    socialProof: "Real people · real reviews",
    tagCanvas: "water-resistant canvas",
    tagReversible: "made with love",
    imageAltBlue: "Cobalt blue pouch",
    imageAltYellow: "Mustard yellow pouch",
    imageAltStriped: "Striped laptop sleeve",
  },
  shop: {
    titlePart1: "Your",
    titleItalic: "everyday",
    titlePart2: "little things.",
    sub: "New shapes and colors, one promise: every stitch sewn by a real human in our Tbilisi studio.",
    filters: {
      all: "All",
      pouch: "Cases",
      laptop: "Cases",
      bag: "Bags",
      kidsbackpack: "Kids' bags",
      apron: "Aprons",
      necklace: "Necklaces",
      new: "New arrivals",
    },
    card: { favourite: "Favourite", addToBasket: "Add to basket" },
    badges: { new: "NEW", bestseller: "BESTSELLER", limited: "LIMITED" },
  },
  products: [
    { name: "Blueberry pouch", sub: "Small · canvas" },
    { name: "Lemon pouch", sub: "Small · canvas" },
    { name: "Stripe laptop sleeve", sub: '13" · padded' },
    { name: "Mustard mini tote", sub: "Medium · canvas" },
    { name: "Cobalt crossbody", sub: "Adjustable strap" },
    { name: "Sunday stripe pouch", sub: "Tablet size" },
    { name: "Little explorer backpack", sub: "Kids' size · canvas" },
    { name: "Starry sky backpack", sub: "Kids' size · canvas" },
    { name: "Sous-chef apron — kids", sub: "Adjustable · canvas" },
    { name: "Sunday kitchen apron — mum", sub: "Long cut · canvas" },
    { name: "Linen cord necklace", sub: "Fabric-knotted" },
    { name: "Seaside shell necklace", sub: "Fabric + shells" },
  ],
  story: {
    eyebrow: "Our story",
    titlePart1: "One bag,",
    titleItalic: "two",
    titlePart2: "lives.",
    body: "Tissu started with a simple idea: canvas, a sewing machine, no shortcuts. A small studio in Tbilisi where every bag is made by hand, and every detail is considered.",
    stats: [
      { num: "100%", label: "Water-resistant canvas" },
      { num: "3", label: "Hands per bag" },
      { num: "2", label: "Sides you can use" },
    ],
    sinceLine1: "Since",
    sinceLine2: "'23",
  },
  process: {
    titlePart1: "From",
    titleItalic: "canvas roll",
    titlePart2: "to your door.",
    sub: "No factories, no shortcuts. Four quiet steps between a bolt of cloth and a bag you'll love for years.",
    steps: [
      { title: "Source", body: "We pick water-resistant canvas from local mills. Colors chosen by season, texture chosen by hand." },
      { title: "Pattern", body: "Each shape is cut from paper templates we've refined for two years — every detail counts." },
      { title: "Stitch & line", body: "Two layers, one seam. Flip it and the bag becomes a whole new friend." },
      { title: "Wrap & send", body: "Wrapped in colorful paper, stickered, and shipped in a kraft-paper bag." },
    ],
  },
  picker: {
    eyebrow: "Build your necklace",
    titlePart1: "Pick a",
    titleItalic: "fabric —",
    titlePart2: "we'll braid your necklace.",
    body: "Necklaces are made to order. Choose the fabric and the shells, and in about 7 days we'll send you a one-of-a-kind handmade piece. Bags on this site are ready-to-ship, not custom.",
    cta: "Start a necklace — from 45₾",
    shipsNote: "ready in ~7 days",
    altPreview: "Selected fabric preview",
  },
  reviews: {
    titlePart1: "Loved by",
    titleItalic: "real",
    titlePart2: "people.",
    sub: "And it's just the beginning. Here's what people are saying about us.",
    items: [
      {
        text: "Got caught in the rain and everything inside stayed dry. When I need a mood boost, I flip it to the lemon side.",
        name: "Mariam K.",
        meta: "Blueberry pouch · Tbilisi",
      },
      {
        text: "It arrived wrapped in a ribbon. The packaging alone made my week — the bag (two bags, really) made my whole year.",
        name: "Sofia R.",
        meta: "Lemon laptop sleeve · Lisbon",
      },
      {
        text: "Finally, a laptop bag that fits right in at brunch. Flip it and it's a meeting bag. The stitching is soft, and the ties are the sweetest detail.",
        name: "Elene D.",
        meta: "Stripe sleeve · Berlin",
      },
    ],
  },
  ig: {
    titlePart1: "Stories from",
    titleItalic: "@thetissushop",
    sub: "Follow along for studio snaps, behind-the-scenes, and the occasional lemon.",
    tiles: [
      { line1: "studio", line2: "snap", likes: "❤ 1.2k" },
      { line1: "BTS", line2: "reel", likes: "❤ 984" },
      { line1: "lemons", line2: "& love", likes: "❤ 2.1k" },
    ],
  },
  newsletter: {
    titlePart1: "Be the first",
    titleItalic: "to know.",
    titlePart2: "",
    body: "New drops, restocks, the occasional good idea. No spam. Two emails a month, tops.",
    placeholder: "your@email.com",
    cta: "I'm in",
  },
  footer: {
    tagline: "Handmade with love in Tbilisi · since 2023.",
    cols: { shop: "Shop", care: "Care", studio: "Studio" },
    shopLinks: ["Cases", "Kids' bags", "Aprons", "Necklaces"],
    careLinks: ["Shipping", "Returns", "Wash guide", "FAQ"],
    studioLinks: ["Our story", "Journal", "Wholesale", "Contact"],
    copyrightSuffix: "made with love in tbilisi",
  },
};

const ka: LandingCopy = {
  marquee: [
    "გადმოაბრუნე.",
    "უფასო მიწოდება 150₾-დან",
    "დღეს თამამი. ხვალ მინიმალური.",
    "ერთი ჩანთა, ორი ხასიათი.",
    "დამზადებულია თბილისში",
  ],
  nav: { shop: "მაღაზია", story: "ჩვენი ამბავი", process: "როგორ მზადდება", journal: "ბლოგი" },
  hero: {
    eyebrow: "ახალი კოლექცია · გაზაფხული '26",
    titlePart1: "ცოტა ფერადი",
    titleItalic: "",
    titlePart2: "ყოველდღიურობა",
    titleSquiggle: "კომპრომისის გარეშე",
    lead: "შექმნილია საქართველოში",
    ctaPrimary: "კოლექციის ნახვა",
    ctaSecondary: "ორივე მხარის ნახვა",
    socialProof: "2,400-ზე მეტი კმაყოფილი მომხმარებელი · ნამდვილი შეფასებები",
    tagCanvas: "წყალგაუმტარი ტილო",
    tagReversible: "ორი მხარე, ერთი ჩანთა",
    imageAltBlue: "კობალტისფერი ორმხრივი ქისა",
    imageAltYellow: "მდოგვისფერი ორმხრივი ქისა",
    imageAltStriped: "ზოლიანი ლეპტოპის გარსი",
  },
  shop: {
    titlePart1: "შენი",
    titleItalic: "ყოველდღიური",
    titlePart2: "წვრილმანებისთვის.",
    sub: "ახალი ფორმები და ფერები, ერთი პირობით: თითოეული ნაკერი ჩვენს თბილისურ სტუდიაში, ცოცხალი ადამიანის ხელითაა გაკეთებული. და რა თქმა უნდა, ყველა ჩანთა ორმხრივია.",
    filters: {
      all: "ყველა",
      pouch: "ქეისები",
      laptop: "ქეისები",
      bag: "ჩანთები",
      kidsbackpack: "საბავშვო ჩანთები",
      apron: "წინსაფრები",
      necklace: "ყელსაბამები",
      new: "სიახლეები",
    },
    card: { favourite: "რჩეულებში დამატება", addToBasket: "კალათაში დამატება" },
    badges: { new: "ახალი", bestseller: "ბესტსელერი", limited: "ლიმიტირებული" },
  },
  products: [
    { name: "მოცვის ორმხრივი ქისა", sub: "პატარა · ტილო · ორმხრივი" },
    { name: "ლიმონის ორმხრივი ქისა", sub: "პატარა · ტილო · ორმხრივი" },
    { name: "ზოლიანი ლეპტოპის გარსი", sub: '13" · დარბილებული · ორმხრივი' },
    { name: "მდოგვისფერი მინი ტომარა", sub: "საშუალო · ტილო · ორმხრივი" },
    { name: "კობალტისფერი მხარზე გადასაკიდი", sub: "რეგულირებადი თასმა · ორმხრივი" },
    { name: "კვირის ზოლიანი ქისა", sub: "პლანშეტის ზომა · ორმხრივი" },
    { name: "პატარა მოგზაურის ზურგჩანთა", sub: "საბავშვო ზომა · ტილო" },
    { name: "ვარსკვლავიანი ზურგჩანთა", sub: "საბავშვო ზომა · ტილო" },
    { name: "პატარა სამზარეულოს წინსაფარი", sub: "რეგულირებადი · ტილო" },
    { name: "დედის სამზარეულოს წინსაფარი", sub: "გრძელი · ტილო" },
    { name: "სელის ძაფის ყელსაბამი", sub: "ნაჭრის კვანძები" },
    { name: "ზღვის ნიჟარების ყელსაბამი", sub: "ნაჭერი + ნიჟარები" },
  ],
  story: {
    eyebrow: "ჩვენი ამბავი",
    titlePart1: "ერთი ჩანთა,",
    titleItalic: "ორი",
    titlePart2: "ცხოვრება.",
    body: "Tissu ერთი იდეიდან დაიწყო: ჩანთის ორივე მხარე ნამდვილად კარგი უნდა იყოს. ტილო, საკერავი მანქანა, მარტივი გზები — არ არსებობს. გადმოაბრუნებ — ორი დიზაინი, ერთი ნივთი. დღემდე პატარა სტუდია ვართ, ხელით ვკერავთ თბილისში.",
    stats: [
      { num: "100%", label: "წყალგაუმტარი ტილო" },
      { num: "3", label: "ხელი თითო ჩანთაზე" },
      { num: "2", label: "გამოსაყენებელი მხარე" },
    ],
    sinceLine1: "2023",
    sinceLine2: "წლიდან",
  },
  process: {
    titlePart1: "ტილოს",
    titleItalic: "რულონიდან",
    titlePart2: "შენს კარამდე.",
    sub: "არანაირი ქარხანა და მარტივი გზები. მხოლოდ ოთხი წყნარი ნაბიჯი ქსოვილის ნაჭრიდან ჩანთამდე, რომელიც წლების განმავლობაში გეყვარება — არ აქვს მნიშვნელობა, რომელ მხარეს აჩვენებ სამყაროს.",
    steps: [
      { title: "ვარჩევთ", body: "წყალგაუმტარ ტილოს ადგილობრივი მომწოდებლებისგან ვარჩევთ. ფერებს — სეზონის მიხედვით, ფაქტურას კი — ხელით." },
      { title: "ვჭრით", body: "თითოეულ ფორმას ქაღალდის თარგებით ვჭრით, რომლებსაც უკვე ორი წელია ვხვეწთ — ყოველთვის ორი პრინტის გათვალისწინებით." },
      { title: "ვკერავთ", body: "ორი ფენა, ერთი ნაკერი. გადმოაბრუნებ და ჩანთა შენი ახალი მეგობარი ხდება." },
      { title: "ვფუთავთ და ვაგზავნით", body: "ფერად ქაღალდში ვახვევთ, სტიკერს ვაკრავთ და კრაფტის ჩანთით გიგზავნით." },
    ],
  },
  picker: {
    eyebrow: "ააწყვე შენი ყელსაბამი",
    titlePart1: "აირჩიე",
    titleItalic: "ნაჭერი,",
    titlePart2: "ჩვენ შეგიკრავთ ყელსაბამს.",
    body: "ყელსაბამები შეკვეთით იქმნება — აირჩიე ნაჭერი, ნიჟარები და 7 დღის შემდეგ გიგზავნით ხელით ნაკრავ უნიკალურ ნივთს. ჩანთები ამ საიტზე მზა მოდელებია და არა შეკვეთით მზადდება.",
    cta: "დავიწყოთ ყელსაბამი — 45₾-დან",
    shipsNote: "მზადდება 7 დღეში",
    altPreview: "არჩეული ნაჭრის ვერსია",
  },
  reviews: {
    titlePart1: "ჩვენი ჩანთები უყვართ",
    titleItalic: "ნამდვილ",
    titlePart2: "ადამიანებს.",
    sub: "2,400-ზე მეტი შეფასება და ეს მხოლოდ დასაწყისია. აი, რას წერენ ჩვენზე.",
    items: [
      {
        text: "წვიმაში მოვყევი და შიგნით ყველაფერი მშრალი დამრჩა. ხასიათის გამოსასწორებლად კი ლიმონის მხარეზე ვაბრუნებ ხოლმე.",
        name: "მარიამ კ.",
        meta: "მოცვის ქისა · თბილისი",
      },
      {
        text: "ლენტით შეკრული ჩამოვიდა. მარტო შეფუთვამ გამაბედნიერა მთელი კვირა, ჩანთამ (უფრო სწორად, ორმა ჩანთამ) კი — მთელი წელი.",
        name: "სოფია რ.",
        meta: "ლიმონის ლეპტოპის გარსი · ლისაბონი",
      },
      {
        text: "საბოლოოდ ვიპოვე ლეპტოპის ჩანთა, რომელიც ბრანჩზეც კი მოუხდებოდა. გადმოაბრუნებ და საქმიანი შეხვედრისთვისაც მზადაა. ნაკერი საოცრად რბილია, ლენტები კი ყველაზე საყვარელი დეტალია.",
        name: "ელენე დ.",
        meta: "ზოლიანი გარსი · ბერლინი",
      },
    ],
  },
  ig: {
    titlePart1: "ამბები",
    titleItalic: "@thetissushop-დან",
    sub: "გამოგვყევით სტუდიის ფოტოების, კულისებიდან კადრების და ხანდახან ლიმონების სანახავად.",
    tiles: [
      { line1: "სტუდიის", line2: "კადრი", likes: "❤ 1.2k" },
      { line1: "კადრს", line2: "მიღმა", likes: "❤ 984" },
      { line1: "ლიმონები", line2: "და სიყვარული", likes: "❤ 2.1k" },
    ],
  },
  newsletter: {
    titlePart1: "პირველმა",
    titleItalic: "გადმოაბრუნე.",
    titlePart2: "",
    body: "ახალი კოლექციები, restocks, ხანდახან კარგი იდეა. სპამი — არ იქნება. თვეში მაქსიმუმ ორი.",
    placeholder: "შენი@ემეილი.ge",
    cta: "ვარ!",
  },
  footer: {
    tagline: "ორი მხარე. ერთი ჩანთა. ხელით ნაკერი თბილისში — 2023 წლიდან.",
    cols: { shop: "მაღაზია", care: "მოვლა", studio: "სტუდია" },
    shopLinks: ["ქეისები", "საბავშვო ჩანთები", "წინსაფრები", "ყელსაბამები"],
    careLinks: ["მიწოდება", "დაბრუნება", "გარეცხვის წესები", "ხშირად დასმული კითხვები"],
    studioLinks: ["ჩვენი ამბავი", "ბლოგი", "საბითუმო", "კონტაქტი"],
    copyrightSuffix: "სიყვარულით შექმნილი თბილისში",
  },
};

export function getLandingCopy(lang: Locale): LandingCopy {
  return lang === "ka" ? ka : en;
}
