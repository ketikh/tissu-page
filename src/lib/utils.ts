import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = "₾") {
  // Use deterministic formatting to avoid server/client locale hydration mismatch
  return `${price.toFixed(2).replace(/\.00$/, '')} ${currency}`;
}

export function setCookie(name: string, value: string, options: { maxAge?: number; path?: string } = {}) {
  if (typeof document === 'undefined') return;
  
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
  if (options.path) cookieString += `; path=${options.path}`;
  cookieString += '; samesite=lax';
  
  document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameLenPlus = name.length + 1;
  return (
    document.cookie
      .split(';')
      .map((c) => c.trim())
      .filter((cookie) => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map((cookie) => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null
  );
}

export function removeCookie(name: string, path: string = '/') {
  setCookie(name, '', { maxAge: -1, path });
}
