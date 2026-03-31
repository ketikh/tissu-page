import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-brand-soft/20 rounded-3xl mt-8 mb-16">
      <h1 className="text-8xl md:text-9xl font-serif text-brand-dark/20 font-bold mb-4">404</h1>
      <h2 className="text-3xl font-serif text-brand-dark font-medium mb-6">Page not found</h2>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg leading-relaxed">
        We can't seem to find the page you're looking for. It might have been removed or the link is incorrect.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
        <Button asChild variant="premium" size="lg" className="w-full text-base">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full bg-white text-base">
          <Link href="/"><Search className="w-4 h-4 mr-2" /> Search</Link>
        </Button>
      </div>
    </div>
  );
}
