import { Product, FAQItem } from "./types";

export const mockProducts: Product[] = [
  {
    id: "ts-001",
    slug: "classic-leather-sleeve",
    name: "The Soft Wrap Sleeve",
    subtitle: "Minimalist padded protection",
    description: "Our signature laptop sleeve designed to cradle your device in premium, soft-touch textiles. Featuring a minimalist fold-over enclosure with hidden magnetic clasps, it offers a secure, scratch-free environment for your laptop.",
    materials: ["100% Organic Cotton Canvas", "Recycled PET Padding", "Soft Microfiber Lining"],
    careInstructions: ["Spot clean with a damp cloth", "Do not machine wash", "Air dry flat"],
    price: 129,
    originalPrice: 149,
    images: ["/product-mock-1.jpg", "/product-mock-1-alt.jpg"], // Placeholders, we'll replace them or use colors
    category: "laptop-sleeves",
    badges: ["Best Seller"],
    featured: true,
    variants: [
      { id: "v1", size: "13-inch", color: "Oat", colorCode: "#e6e0d8", inStock: true },
      { id: "v2", size: "14-inch", color: "Oat", colorCode: "#e6e0d8", inStock: true },
      { id: "v3", size: "16-inch", color: "Oat", colorCode: "#e6e0d8", inStock: false },
      { id: "v4", size: "13-inch", color: "Charcoal", colorCode: "#3a3632", inStock: true },
    ],
    reviews: [
      { id: "r1", author: "Anna K.", rating: 5, date: "2024-02-14", content: "Absolutely beautiful material. Fits my MacBook Pro 14 like a glove." }
    ]
  },
  {
    id: "ts-002",
    slug: "reversible-daily-sleeve",
    name: "Reversible Daily Sleeve",
    subtitle: "Two tones, one elegant design",
    description: "A versatile laptop cover that flips inside out to match your mood. Carefully crafted from high-density woven fabric that feels incredibly soft yet rugged enough for daily commutes.",
    materials: ["Premium Linen Blend", "Felt Core", "Reinforced Stitching"],
    careInstructions: ["Dry clean recommended"],
    price: 110,
    images: ["/product-mock-2.jpg"],
    category: "laptop-sleeves",
    badges: ["New Arrival"],
    featured: true,
    variants: [
      { id: "v5", size: "13/14-inch", color: "Caramel / Cream", colorCode: "#c4a991", inStock: true },
      { id: "v6", size: "15/16-inch", color: "Caramel / Cream", colorCode: "#c4a991", inStock: true },
    ],
    reviews: []
  },
  {
    id: "ts-003",
    slug: "essential-cable-pouch",
    name: "Essential Cable Pouch",
    subtitle: "Organized serenity",
    description: "Keep your chargers, cables, and small accessories detangled and beautifully stored. Designed to complement your Tissu laptop sleeve.",
    materials: ["100% Organic Cotton Canvas", "Vegan Leather Pull"],
    careInstructions: ["Spot clean"],
    price: 45,
    images: ["/product-mock-3.jpg"],
    category: "pouches",
    badges: [],
    variants: [
      { id: "v7", size: "One Size", color: "Oat", colorCode: "#e6e0d8", inStock: true },
      { id: "v8", size: "One Size", color: "Charcoal", colorCode: "#3a3632", inStock: true },
    ],
    reviews: []
  }
];

export const mockFAQs: FAQItem[] = [
  { question: "How do I choose the right size?", answer: "Our 13/14-inch sleeves snugly fit MacBook Air M1/M2 and 14-inch MacBook Pros. Check our detailed size guide on each product page for exact interior dimensions." },
  { question: "Do you offer international shipping?", answer: "Currently, we ship locally across Georgia and to select European countries. We are expanding our shipping zones later this year." },
  { question: "What is your return policy?", answer: "We accept returns within 14 days of delivery for unused items in their original packaging. Please contact our support team to initiate a return." },
  { question: "Are your products machine washable?", answer: "Most of our sleeves use structured padding that could lose shape in a machine. We recommend gentle spot cleaning with a damp cloth and mild soap." }
];
