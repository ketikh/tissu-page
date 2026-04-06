export type Category = "laptop-sleeves" | "accessories" | "pouches" | "all";

export interface BilingualText {
  ka: string;
  en: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  streetAddress: string;
  phone: string;
  notes?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
  orders: Order[];
}

export interface ProductVariant {
  id: string;
  size: string;
  color: BilingualText;
  colorCode: string;
  inStock: boolean;
  price?: number; // Optional override
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: BilingualText;
}

export interface Product {
  id: string;
  slug: string;
  name: BilingualText;
  subtitle: BilingualText;
  description: BilingualText;
  materials: BilingualText[];
  careInstructions: BilingualText[];
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  variants: ProductVariant[];
  badges: BilingualText[]; // e.g., "Best Seller", "New", "Limited"
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

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: BilingualText;
  variantName: BilingualText;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: Omit<Address, "id" | "isDefault">;
  paymentMethod: "card" | "cash";
}

export interface FAQCategory {
  title: BilingualText;
  items: FAQItem[];
}

export interface FAQItem {
  question: BilingualText;
  answer: BilingualText;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}
