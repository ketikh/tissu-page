import type { Metadata } from "next";
import { Outfit, Fredoka, Noto_Sans_Georgian, Noto_Serif_Georgian } from "next/font/google";
import "../globals.css";
import { i18n, Locale } from "@/i18n/config";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { getDictionary } from "@/i18n/getDictionary";



const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoOld = Noto_Sans_Georgian({
  variable: "--font-noto-sans",
  subsets: ["georgian"],
  display: "swap",
});

const notoSerif = Noto_Serif_Georgian({
  variable: "--font-noto-serif",
  subsets: ["georgian"],
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);
  return {
    title: locale === 'ka' ? "Tissu | პრემიუმ ტექსტილი და აქსესუარები" : "Tissu | Premium Textile & Lifestyle Brand",
    description: dictionary.home.hero.title,
  };
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <html 
      lang={locale} 
      className={`${outfit.variable} ${fredoka.variable} ${notoOld.variable} ${notoSerif.variable} scroll-smooth`}
    >
      <body className={`min-h-screen flex flex-col antialiased bg-background text-foreground ${locale === 'ka' ? 'font-noto-sans' : 'font-sans'}`}>
          <AnnouncementBar lang={locale} dictionary={dictionary} />
          <Navbar lang={locale} dictionary={dictionary} />
          <CartDrawer dictionary={dictionary} lang={locale} />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer dictionary={dictionary} />
      </body>
    </html>
  );
}
