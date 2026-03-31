export type Category = "laptop-sleeves" | "accessories" | "pouches" | "all";

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorCode: string;
  inStock: boolean;
  price?: number; // Optional override
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  materials: string[];
  careInstructions: string[];
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  variants: ProductVariant[];
  badges: string[]; // e.g., "Best Seller", "New", "Limited"
  reviews: Review[];
  featured?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  city: string; // Crucial for Georgia
  streetAddress: string;
  phone: string; // Crucial for Georgia
  notes?: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: Address;
}

export interface FAQCategory {
  title: string;
  items: FAQItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}
