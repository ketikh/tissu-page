import { Product, FAQItem } from "./types";

export const mockProducts: Product[] = [
  {
    id: "ts-001",
    slug: "classic-laptop-sleeve",
    name: { ka: "რბილი ლეპტოპის ჩასადები", en: "The Soft Wrap Sleeve" },
    subtitle: { ka: "მინიმალიზმი და დაცვა", en: "Minimalism meets protection" },
    description: { 
      ka: "ჩვენი გამორჩეული ლეპტოპის ჩასადები, შექმნილი თქვენი მოწყობილობისთვის უმაღლესი ხარისხის, რბილ ტექსტილში. აქვს მინიმალისტური დიზაინი და ფარული მაგნიტური შესაკრავი. სტრუქტურული დაცვა და ექსკლუზიური შეგრძნება.",
      en: "Our signature laptop sleeve, crafted from high-quality soft textile. It features a minimalist design with a hidden magnetic closure for seamless access. Structural protection and an exclusive tactile feel."
    },
    materials: [
      { ka: "100% ორგანული ბამბა", en: "100% Organic Cotton" },
      { ka: "გადამუშავებული PET შემავსებელი", en: "Recycled PET Padding" },
      { ka: "რბილი მიკროფიბრის სარჩული", en: "Soft Microfiber Lining" }
    ],
    careInstructions: [
      { ka: "გაწმინდეთ სველი ქსოვილით", en: "Spot clean with a damp cloth" },
      { ka: "არ გარეცხოთ მანქანაში", en: "Do not machine wash" },
      { ka: "გააშრეთ ჰორიზონტალურად", en: "Dry flat" }
    ],
    price: 129,
    originalPrice: 149,
    images: ["/static/471226227_122127826406568616_10710597037626146_n.jpg", "/static/471369447_122127828926568616_2165186181436469590_n.jpg", "/static/product.jpg"],
    category: "laptop-sleeves",
    badges: [{ ka: "ბესტსელერი", en: "Bestseller" }],
    featured: true,
    variants: [
      { id: "v1", size: "13-inch", color: { ka: "ღია კრემისფერი", en: "Oat" }, colorCode: "#e6e0d8", inStock: true },
      { id: "v2", size: "14-inch", color: { ka: "ღია კრემისფერი", en: "Oat" }, colorCode: "#e6e0d8", inStock: true },
      { id: "v3", size: "16-inch", color: { ka: "ღია კრემისფერი", en: "Oat" }, colorCode: "#e6e0d8", inStock: false },
      { id: "v4", size: "13-inch", color: { ka: "ნაცრისფერი", en: "Charcoal" }, colorCode: "#3a3632", inStock: true },
    ],
    reviews: [
      { 
        id: "r1", 
        author: "Ana K.", 
        rating: 5, 
        date: "2024-02-14", 
        content: {
          ka: "ულამაზესი მასალა. ჩემს 14 ინჩიან MacBook Pro-ს იდეალურად მოერგო.",
          en: "Beautiful material. Fits my 14-inch MacBook Pro perfectly."
        }
      }
    ]
  },
  {
    id: "ts-002",
    slug: "reversible-daily-sleeve",
    name: { ka: "ორმხრივი ყოველდღიური ქეისი", en: "Reversible Daily Sleeve" },
    subtitle: { ka: "ორი ტონი, ერთი ელეგანტური დიზაინი", en: "Two tones, one elegant design" },
    description: {
      ka: "უნივერსალური ლეპტოპის ჩასადები, რომლის ამოტრიალებაც შეგიძლიათ თქვენი განწყობის მიხედვით. დამზადებულია მაღალი სიმკვრივის ნაქსოვი ქსოვილისგან, რომელიც ძალიან რბილი, მაგრამ გამძლეა.",
      en: "A versatile laptop sleeve that can be flipped depending on your mood. Made from high-density knit fabric that is incredibly soft yet durable."
    },
    materials: [
      { ka: "პრემიუმ სელის ნაზავი", en: "Premium Linen Blend" },
      { ka: "თექის ბირთვი", en: "Felted Core" },
      { ka: "გაძლიერებული ნაკერები", en: "Reinforced Stitching" }
    ],
    careInstructions: [
      { ka: "რეკომენდებულია მშრალი წმენდა", en: "Dry clean recommended" }
    ],
    price: 110,
    images: ["/static/474091526_17860793676341330_5734924257999808994_n.jpg", "/static/sleeve1.jpg"],
    category: "laptop-sleeves",
    badges: [{ ka: "ახალი კოლექცია", en: "New Collection" }],
    featured: true,
    variants: [
      { id: "v5", size: "13/14-inch", color: { ka: "კარამელისფერი", en: "Caramel" }, colorCode: "#c4a991", inStock: true },
      { id: "v6", size: "15/16-inch", color: { ka: "კარამელისფერი", en: "Caramel" }, colorCode: "#c4a991", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-003",
    slug: "cloud-quilted-sleeve",
    name: { ka: "Cloud-დატიხრული ჩასადები", en: "The Cloud Quilted Sleeve" },
    subtitle: { ka: "მაქსიმალური დაცვა", en: "Maximum padding for extra care" },
    description: {
      ka: "ჩვენი ყველაზე რბილი ჩასადები. დატიხრული დიზაინი ქმნის ჰაეროვან ბალიშს თქვენი ლეპტოპისთვის. იდეალურია მათთვის, ვინც ხშირად მოგზაურობს.",
      en: "Our softest sleeve yet. The quilted design creates an airy cushion for your laptop. Perfect for frequent travelers."
    },
    materials: [
      { ka: "გადამუშავებული ნეილონი", en: "Recycled Nylon" },
      { ka: "ჰიპოალერგიული შიგთავსი", en: "Hypoallergenic Fill" }
    ],
    careInstructions: [
      { ka: "გარეცხეთ ცივ წყალში", en: "Machine wash cold" }
    ],
    price: 135,
    images: ["/static/476026894_17862532341341330_5401506917507063176_n.jpg", "/static/476234638_17862708918341330_1145840695932038025_n.jpg"],
    category: "laptop-sleeves",
    badges: [],
    variants: [
      { id: "v9", size: "13-inch", color: { ka: "ღრუბლისფერი", en: "Sky Blue" }, colorCode: "#d0e1f9", inStock: true },
      { id: "v10", size: "14-inch", color: { ka: "ღრუბლისფერი", en: "Sky Blue" }, colorCode: "#d0e1f9", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-004",
    slug: "essential-cable-pouch",
    name: { ka: "ტექ-აქსესუარების ჩანთა", en: "Essential Tech Pouch" },
    subtitle: { ka: "ორგანიზებული სიმშვიდე", en: "Organized peace of mind" },
    description: {
      ka: "შეინახეთ თქვენი დამტენები, კაბელები და პატარა ნივთები იდეალურად დალაგებული. კომპაქტური დიზაინი, რომელიც ეტევა ნებისმიერ ჩანთაში.",
      en: "Keep your chargers, cables, and small essentials perfectly organized. Compact design that fits into any larger bag."
    },
    materials: [
      { ka: "100% ორგანული ბამბა", en: "100% Organic Cotton" },
      { ka: "წყალგაუმტარი ფენა", en: "Water-resistant Lining" }
    ],
    careInstructions: [
      { ka: "გაწმინდეთ სველი ქსოვილით", en: "Spot clean with a damp cloth" }
    ],
    price: 45,
    images: ["/static/477013856_17863141566341330_421160502951281373_n.jpg", "/static/sleeve1.jpg"],
    category: "accessories",
    badges: [],
    variants: [
      { id: "v7", size: "One Size", color: { ka: "კრემისფერი", en: "Cream" }, colorCode: "#e6e0d8", inStock: true },
      { id: "v8", size: "One Size", color: { ka: "ნაცრისფერი", en: "Charcoal" }, colorCode: "#3a3632", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-005",
    slug: "velvet-mini-pouch",
    name: { ka: "ხავერდის მინი ჩანთა", en: "Velvet Mini Pouch" },
    subtitle: { ka: "დელიკატური აქსესუარი", en: "A delicate touch for your essentials" },
    description: {
      ka: "პატარა, ნაზი ჩანთა თქვენი ყურსასმენებისთვის ან პატარა ნივთებისთვის. დამზადებულია პრემიუმ ხავერდისგან.",
      en: "A small, delicate pouch for your earphones or tiny essentials. Crafted from premium velvet."
    },
    materials: [
      { ka: "იტალიური ხავერდი", en: "Italian Velvet" },
      { ka: "აბრეშუმის სარჩული", en: "Silk Lining" }
    ],
    careInstructions: [
      { ka: "მხოლოდ მშრალი წმენდა", en: "Dry clean only" }
    ],
    price: 35,
    images: ["/static/sleeve2.jpg", "/static/sleeve1.jpg"],
    category: "accessories",
    badges: [{ ka: "ლიმიტირებული", en: "Limited Edition" }],
    variants: [
      { id: "v11", size: "Mini", color: { ka: "შინდისფერი", en: "Burgundy" }, colorCode: "#800020", inStock: true },
      { id: "v12", size: "Mini", color: { ka: "ზურმუხტისფერი", en: "Emerald" }, colorCode: "#046307", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-006",
    slug: "linen-everyday-tote",
    name: { ka: "ყოველდღიური სელის ჩანთა", en: "Linen Everyday Tote" },
    subtitle: { ka: "მსუბუქი და ტევადი", en: "Lightweight and spacious" },
    description: {
      ka: "იდეალური ჩანთა ყოველდღიური გამოყენებისთვის. სელის ნატურალური ფაქტურა და გამძლე სახელურები.",
      en: "The perfect tote for everyday use. Natural linen texture and durable handles."
    },
    materials: [
      { ka: "100% ნატურალური სელი", en: "100% Natural Linen" }
    ],
    careInstructions: [
      { ka: "ხელით რეცხვა", en: "Hand wash only" }
    ],
    price: 85,
    images: ["/static/product.jpg", "/static/cover.jpg"],
    category: "accessories",
    badges: [],
    variants: [
        { id: "v13", size: "L", color: { ka: "ნატურალური", en: "Natural" }, colorCode: "#d2b48c", inStock: true },
    ],
    reviews: []
  }
];

export const mockFAQs: FAQItem[] = [
  { 
    question: { ka: "როგორ ავირჩიო სწორი ზომა?", en: "How do I choose the right size?" }, 
    answer: { ka: "ჩვენი 13/14-დუიმიანი ჩასადებები იდეალურად ერგება MacBook Air M1/M2 და 14-დუიმიან MacBook Pro-ს. შეამოწმეთ პროდუქტის ზომის გზამკვლევი ზუსტი შიდა ზომებისთვის.", en: "Our 13/14-inch sleeves fit perfectly with MacBook Air M1/M2 and 14-inch MacBook Pro. Check our size guide for exact internal dimensions." } 
  },
  { 
    question: { ka: "შესაძლებელია საერთაშორისო გადაზიდვა?", en: "Is international shipping available?" }, 
    answer: { ka: "ამჟამად პროდუქციას ვაწვდით მხოლოდ საქართველოს მასშტაბით. წლის ბოლოსთვის ვგეგმავთ საერთაშორისო მიწოდების დამატებას.", en: "Currently, we only ship within Georgia. We plan to add international shipping by the end of the year." } 
  },
  { 
    question: { ka: "როგორია დაბრუნების პოლიტიკა?", en: "What is the return policy?" }, 
    answer: { ka: "თქვენ შეგიძლიათ დააბრუნოთ ნივთი 14 დღის განმავლობაში, თუ ის არის გამოუყენებელი და პირვანდელ მდგომარეობაში.", en: "You can return items within 14 days if they are unused and in their original condition." } 
  },
  { 
    question: { ka: "შეიძლება ჩასადების სარეცხ მანქანაში გარეცხვა?", en: "Can I machine wash the sleeve?" }, 
    answer: { ka: "არა, ჩვენი პროდუქტების უმეტესობას აქვს სტრუქტურული შემავსებელი, რომელმაც შეიძლება ფორმა დაკარგოს მანქანაში რეცხვისას. რეკომენდებულია ლაქების მსუბუქი გაწმენდა სველი ქსოვილით.", en: "No, most of our products have structural padding that might lose its shape in the wash. Spot cleaning with a damp cloth is recommended." } 
  }
];
