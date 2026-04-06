"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { useParams } from "next/navigation";

export default function NotFound() {
  const params = useParams();
  const lang = params.lang as string || "ka";

  // Note: Since we can't easily fetch dictionary in client-side not-found 
  // without a provider or a parent, and not-found is a special case in Next.js,
  // we'll keep the conditional logic for now, or assume common keywords.
  // Actually, I'll just use the lang check as it is already there, 
  // but I'll make sure it's consistent with my dictionary keys if possible.

  return (
    <div className="container min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-brand-soft/20 rounded-3xl mt-8 mb-16">
      <h1 className="text-8xl md:text-9xl font-serif text-brand-dark/20 font-bold mb-4">404</h1>
      <h2 className="text-3xl font-serif text-brand-dark font-medium mb-6">
        {lang === 'ka' ? "გვერდი ვერ მოიძებნა" : "Page Not Found"}
      </h2>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg leading-relaxed">
        {lang === 'ka' 
          ? "სამწუხაროდ, გვერდი, რომელსაც ეძებთ, ვერ მოიძებნა. ის შესაძლოა წაშლილია ან ბმული არასწორია."
          : "Sorry, the page you're looking for doesn't exist. It might have been moved or deleted."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
        <Button asChild variant="premium" size="lg" className="w-full text-base">
          <Link href={`/${lang}/shop`}>{lang === 'ka' ? "მაღაზიაში დაბრუნება" : "Go to Shop"}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full bg-white text-base">
          <Link href={`/${lang}`}><Search className="w-4 h-4 mr-2" /> {lang === 'ka' ? "მთავარი" : "Go Home"}</Link>
        </Button>
      </div>
    </div>
  );
}
