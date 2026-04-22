import { Product, FAQItem } from "./types";

export const mockProducts: Product[] = [
  {
    id: "ts-001",
    slug: "blueberry-quilted-pouch",
    name: { ka: "მოცვისფერი ქვილტინგ ჩანთა", en: "Blueberry quilted pouch" },
    subtitle: { ka: "პატარა · ბამბა", en: "Small · cotton" },
    description: { 
      ka: "ხელით ნაკერი ქვილტინგ ჩანთა, დამზადებულია 100% ნატურალური ბამბისგან. იდეალურია პატარა ნივთების ორგანიზებისთვის.",
      en: "Handmade quilted pouch, crafted from 100% natural cotton. Perfect for organizing your little essentials."
    },
    materials: [
      { ka: "100% ბამბა", en: "100% Cotton" },
      { ka: "ბამბის სარჩული", en: "Cotton Lining" }
    ],
    careInstructions: [
      { ka: "ხელით რეცხვა", en: "Hand wash only" },
      { ka: "გააშრეთ ჩრდილში", en: "Dry in shade" }
    ],
    price: 85,
    images: ["/static/landing-bag-blue.jpg", "/static/sleeve2.jpg"],
    category: "pouches",
    badges: [{ ka: "ახალი", en: "NEW" }],
    featured: true,
    variants: [
      { id: "v1", size: "Small", color: { ka: "კობალტი", en: "Cobalt" }, colorCode: "#264ba0", inStock: true },
      { id: "v2", size: "Small", color: { ka: "ლილა", en: "Lilac" }, colorCode: "#b89bd9", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-002",
    slug: "lemon-quilted-pouch",
    name: { ka: "ლიმონისფერი ქვილტინგ ჩანთა", en: "Lemon quilted pouch" },
    subtitle: { ka: "პატარა · ბამბა", en: "Small · cotton" },
    description: {
      ka: "მზიანი ლიმონისფერი ჩანთა, რომელიც თქვენს დღეს გაახალისებს. შექმნილია თბილისურ სტუდიაში დიდი სიყვარულით.",
      en: "A sunny lemon pouch to brighten your day. Made with love in our Tbilisi studio."
    },
    materials: [
      { ka: "100% ბამბა", en: "100% Cotton" }
    ],
    careInstructions: [
      { ka: "ხელით რეცხვა", en: "Hand wash only" }
    ],
    price: 85,
    images: ["/static/landing-bag-yellow.jpg", "/static/sleeve1.jpg"],
    category: "pouches",
    badges: [{ ka: "ბესტსელერი", en: "BESTSELLER" }],
    featured: true,
    variants: [
      { id: "v3", size: "Small", color: { ka: "მდოგვისფერი", en: "Mustard" }, colorCode: "#e8b23a", inStock: true },
      { id: "v4", size: "Small", color: { ka: "ტერაკოტა", en: "Terracotta" }, colorCode: "#f65c32", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-003",
    slug: "stripe-laptop-sleeve",
    name: { ka: "ზოლიანი ლეპტოპის ქერქი", en: "Stripe laptop sleeve" },
    subtitle: { ka: '13" · რბილი შიგთავსი', en: '13" · padded' },
    description: {
      ka: "კლასიკური ზოლები და საიმედო დაცვა თქვენი ლეპტოპისთვის. რბილი შიგთავსი უზრუნველყოფს უსაფრთხოებას ყოველდღიური მოხმარებისას.",
      en: "Classic stripes and reliable protection for your laptop. Padded lining ensures safety during daily commutes."
    },
    materials: [
      { ka: "ბამბის კანვა", en: "Cotton Canvas" },
      { ka: "რბილი შემავსებელი", en: "Soft Padding" }
    ],
    careInstructions: [
      { ka: "მხოლოდ მშრალი წმენდა", en: "Spot clean only" }
    ],
    price: 140,
    images: ["/static/landing-bag-striped.png", "/static/product.jpg"],
    category: "laptop-sleeves",
    badges: [],
    featured: true,
    variants: [
      { id: "v5", size: '13-inch', color: { ka: "ზოლიანი", en: "Stripe" }, colorCode: "#f3c758", inStock: true },
      { id: "v6", size: '14-inch', color: { ka: "ზოლიანი", en: "Stripe" }, colorCode: "#f3c758", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-004",
    slug: "mustard-mini-tote",
    name: { ka: "ხახვისფერი მინი თოუთი", en: "Mustard mini tote" },
    subtitle: { ka: "საშუალო · ბამბის კანვა", en: "Medium · cotton canvas" },
    description: {
      ka: "იდეალური მინი ჩანთა თქვენი ყოველდღიური გასვლებისთვის. მყარი და გამძლე.",
      en: "The perfect mini tote for your everyday outings. Sturdy and durable."
    },
    materials: [
      { ka: "ბამბის კანვა", en: "Cotton Canvas" }
    ],
    careInstructions: [
      { ka: "ხელით რეცხვა", en: "Hand wash" }
    ],
    price: 120,
    images: ["/static/landing-bag-yellow.jpg", "/static/sleeve1.jpg"],
    category: "accessories",
    badges: [],
    variants: [
      { id: "v7", size: "Medium", color: { ka: "მდოგვისფერი", en: "Mustard" }, colorCode: "#e8b23a", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-005",
    slug: "cobalt-crossbody",
    name: { ka: "კობალტის კროსბოდი", en: "Cobalt crossbody" },
    subtitle: { ka: "რეგულირებადი სამაჯური", en: "Adjustable strap" },
    description: {
      ka: "ელეგანტური და პრაქტიკული კროსბოდი ჩანთა. კობალტისფერი ბამბის ქსოვილი და ხელით ნამუშევარი დეტალები.",
      en: "Elegant and practical crossbody bag. Cobalt cotton fabric and handmade details."
    },
    materials: [
      { ka: "100% ბამბა", en: "100% Cotton" }
    ],
    careInstructions: [
      { ka: "ხელით რეცხვა", en: "Hand wash only" }
    ],
    price: 165,
    images: ["/static/landing-bag-blue.jpg", "/static/sleeve2.jpg"],
    category: "accessories",
    badges: [{ ka: "ახალი", en: "NEW" }],
    variants: [
      { id: "v8", size: "One Size", color: { ka: "კობალტი", en: "Cobalt" }, colorCode: "#264ba0", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-006",
    slug: "sunday-stripe-pouch",
    name: { ka: "კვირის ზოლიანი ჩანთა", en: "Sunday stripe pouch" },
    subtitle: { ka: "ტაბლეტის ზომა", en: "Tablet size" },
    description: {
      ka: "ჩვენი საყვარელი ზოლიანი ჩანთის ახალი ვერსია. ტოლია თქვენი ტაბლეტის ან დიდი ბლოკნოტისთვის.",
      en: "A new version of our favorite striped pouch. Fits your tablet or a large notebook."
    },
    materials: [
      { ka: "100% ბამბა", en: "100% Cotton" }
    ],
    careInstructions: [
      { ka: "ხელით რეცხვა", en: "Hand wash only" }
    ],
    price: 95,
    images: ["/static/landing-bag-striped.png", "/static/product.jpg"],
    category: "pouches",
    badges: [{ ka: "შეზღუდული", en: "LIMITED" }],
    variants: [
        { id: "v9", size: "Large", color: { ka: "ზოლიანი", en: "Stripe" }, colorCode: "#f3c758", inStock: true },
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
