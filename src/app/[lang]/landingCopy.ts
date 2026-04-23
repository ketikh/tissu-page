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
    "handmade with love",
    "free shipping over 150₾",
    "water-resistant canvas",
    "two sides, one bag",
    "made in tbilisi",
  ],
  nav: { shop: "Shop", story: "Our story", process: "How it's made", journal: "Journal" },
  hero: {
    eyebrow: "Spring / summer '26 drop",
    titlePart1: "Carry your",
    titleItalic: "little",
    titlePart2: "joys,",
    titleSquiggle: "softly",
    lead: "Handmade reversible pouches, laptop sleeves and tote bags in water-resistant canvas — cut, stitched and tied by hand in a sunlit studio in Tbilisi. Two designs, one bag. Built for the rain, the commute, and everything you carry.",
    ctaPrimary: "Shop the drop",
    ctaSecondary: "Our story",
    socialProof: "2,400+ happy humans · verified reviews",
    tagCanvas: "water-resistant canvas",
    tagReversible: "two sides, one bag",
    imageAltBlue: "Cobalt blue reversible pouch",
    imageAltYellow: "Mustard yellow reversible pouch",
    imageAltStriped: "Striped laptop sleeve",
  },
  shop: {
    titlePart1: "The",
    titleItalic: "everyday",
    titlePart2: "little-things edit.",
    sub: "Six new shapes, three fabrics, one promise: every stitch tied by a real human in our Tbilisi studio. Every bag reversible.",
    filters: {
      all: "All",
      pouch: "Pouches",
      laptop: "Laptop sleeves",
      bag: "Tote bags",
      kidsbackpack: "Kids' backpacks",
      apron: "Aprons",
      necklace: "Necklaces",
      new: "New arrivals",
    },
    card: { favourite: "Favourite", addToBasket: "Add to basket" },
    badges: { new: "NEW", bestseller: "BESTSELLER", limited: "LIMITED" },
  },
  products: [
    { name: "Blueberry reversible pouch", sub: "Small · canvas · reversible" },
    { name: "Lemon reversible pouch", sub: "Small · canvas · reversible" },
    { name: "Stripe laptop sleeve", sub: '13" · padded · reversible' },
    { name: "Mustard mini tote", sub: "Medium · canvas · reversible" },
    { name: "Cobalt crossbody", sub: "Adjustable strap · reversible" },
    { name: "Sunday stripe pouch", sub: "Tablet size · reversible" },
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
    body: "Tissu started as Sunday-afternoon sewing in a sunny Tbilisi kitchen — water-resistant canvas, a vintage machine, and the idea that a bag should work twice as hard. Flip it inside out: two prints, one piece. Still tiny, still handmade, still a little obsessed with getting the tie-ribbons just right.",
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
    titlePart2: "to your doorstep.",
    sub: "No factories, no shortcuts. Just four quiet steps between a bolt of cloth and a bag you'll love for years — whichever side you flip to the world.",
    steps: [
      { title: "Source", body: "We pick water-resistant canvas from local mills. Colours chosen by season, texture chosen by hand." },
      { title: "Pattern", body: "Each shape is cut from paper templates we've refined for two years running — with two prints in mind." },
      { title: "Stitch & line", body: "Two layers, one seam. Flip it and the bag becomes a whole new friend." },
      { title: "Wrap & send", body: "Wrapped in colourful paper, stickered, and sent off in a kraft-paper bag." },
    ],
  },
  picker: {
    eyebrow: "Build your own · necklaces only",
    titlePart1: "Pick a",
    titleItalic: "fabric,",
    titlePart2: "we'll braid your necklace.",
    body: "Necklaces are made to order. Choose the canvas and the shells — we'll braid a one-of-a-kind piece for you in about 7 days. Bags on this site are ready-to-ship, not custom.",
    cta: "Start a necklace — from 45₾",
    shipsNote: "ready in ~7 days",
    altPreview: "Selected fabric preview",
  },
  reviews: {
    titlePart1: "Loved by",
    titleItalic: "real",
    titlePart2: "humans.",
    sub: "2,400+ reviews and counting. Here's a little scoop of what folks are saying.",
    items: [
      {
        text: "Got caught in the rain — stuff inside stayed dry. And I flip it to the lemon side when I need a mood boost.",
        name: "Mariam K.",
        meta: "Blueberry pouch · Tbilisi",
      },
      {
        text: "It arrived wrapped in a linen ribbon. The packaging alone made my week — the bag (two bags, really) made my whole year.",
        name: "Sofia R.",
        meta: "Lemon laptop sleeve · Lisbon",
      },
      {
        text: "Finally a laptop bag that looks like it belongs at brunch. Flip it and it's a meeting bag. Stitching is buttery, ties are the sweetest detail.",
        name: "Elene D.",
        meta: "Stripe sleeve · Berlin",
      },
    ],
  },
  ig: {
    titlePart1: "From",
    titleItalic: "@thetissushop",
    sub: "Follow along for studio snaps, behind-the-scenes, and the occasional lemon.",
    tiles: [
      { line1: "studio", line2: "snap", likes: "❤ 1.2k" },
      { line1: "BTS", line2: "reel", likes: "❤ 984" },
      { line1: "lemons", line2: "& love", likes: "❤ 2.1k" },
    ],
  },
  newsletter: {
    titlePart1: "Get",
    titleItalic: "first dibs",
    titlePart2: "on new drops.",
    body: "Two emails a month, tops. New colours, studio peeks, and a 10% code on us.",
    placeholder: "you@lovely.com",
    cta: "Sign me up",
  },
  footer: {
    tagline: "Handmade reversible bags from Tbilisi in water-resistant canvas. Cut, stitched, and tied by hand — since 2023.",
    cols: { shop: "Shop", care: "Care", studio: "Studio" },
    shopLinks: ["Pouches", "Laptop sleeves", "Totes", "Kids' backpacks", "Aprons", "Necklaces", "Gift cards"],
    careLinks: ["Shipping", "Returns", "Wash guide", "FAQ"],
    studioLinks: ["Our story", "Journal", "Wholesale", "Contact"],
    copyrightSuffix: "made with love in tbilisi",
  },
};

const ka: LandingCopy = {
  marquee: [
    "სიყვარულით შექმნილი",
    "უფასო მიწოდება 150₾-დან",
    "წყალგაუმტარი ტილო",
    "ორი მხარე, ერთი ჩანთა",
    "დამზადებულია თბილისში",
  ],
  nav: { shop: "მაღაზია", story: "ჩვენი ამბავი", process: "როგორ მზადდება", journal: "ბლოგი" },
  hero: {
    eyebrow: "გაზაფხული / ზაფხული '26",
    titlePart1: "ერთი ჩანთა.",
    titleItalic: "ორი",
    titlePart2: "განსხვავებული",
    titleSquiggle: "ხასიათი",
    lead: "ხელით ნაკერი ორმხრივი ქისები, ლეპტოპის გარსები და ტომრები წყალგაუმტარი ტილოსგან — თბილისის მზიან სტუდიაში, ხელით გამოჭრილი, შეკერილი და ლენტით შეკრული. ერთი ჩანთა, ორი დიზაინი. შექმნილია წვიმისთვის, ქალაქში ხეტიალისთვის და ყველა იმ ნივთისთვის, რასაც გულით დაატარებ.",
    ctaPrimary: "კოლექციის ნახვა",
    ctaSecondary: "ჩვენი ამბავი",
    socialProof: "2,400-ზე მეტი ბედნიერი ადამიანი · ნამდვილი შეფასებები",
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
      pouch: "ქისები",
      laptop: "ლეპტოპის გარსები",
      bag: "ტომრები",
      kidsbackpack: "საბავშვო ზურგჩანთები",
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
    body: "Tissu დაიწყო კვირა დღეს, თბილისის მზიან სამზარეულოში კერვით — წყალგაუმტარი ტილო, ძველი საკერავი მანქანა და იდეა, რომ ერთ ჩანთას ორჯერ მეტი უნდა შეეძლოს. გადმოაბრუნებ და სულ სხვაა: ორი პრინტი, ერთი ნივთი. დღემდე პატარა სტუდია ვართ, დღემდე ხელით ვკერავთ და დღემდე განსაკუთრებულად გვიყვარს, როცა შესაკრავი ლენტები იდეალურად ჯდება.",
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
    titleItalic: "გაიგე",
    titlePart2: "სიახლეების შესახებ.",
    body: "თვეში მაქსიმუმ ორი იმეილი. ახალი ფერები, კადრები სტუდიიდან და 10%-იანი ფასდაკლების კოდი ჩვენგან.",
    placeholder: "შენი@მეილი.ge",
    cta: "გამოწერა",
  },
  footer: {
    tagline: "ხელით ნაკერი ორმხრივი ჩანთები თბილისიდან, წყალგაუმტარი ტილოსგან. ხელით გამოჭრილი, შეკერილი და შეკრული — 2023 წლიდან.",
    cols: { shop: "მაღაზია", care: "მოვლა", studio: "სტუდია" },
    shopLinks: ["ქისები", "ლეპტოპის გარსები", "ტომრები", "საბავშვო ზურგჩანთები", "წინსაფრები", "ყელსაბამები", "სასაჩუქრე ბარათები"],
    careLinks: ["მიწოდება", "დაბრუნება", "გარეცხვის წესები", "ხშირად დასმული კითხვები"],
    studioLinks: ["ჩვენი ამბავი", "ბლოგი", "საბითუმო", "კონტაქტი"],
    copyrightSuffix: "სიყვარულით შექმნილი თბილისში",
  },
};

export function getLandingCopy(lang: Locale): LandingCopy {
  return lang === "ka" ? ka : en;
}
