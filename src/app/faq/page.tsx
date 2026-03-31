"use client";

import { useState } from "react";
import { mockFAQs } from "@/lib/mock-data";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container max-w-3xl px-4 py-24 md:py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-dark font-medium mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">Everything you need to know about our products, shipping, and returns.</p>
      </div>

      <div className="space-y-4">
        {mockFAQs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`border border-border rounded-xl transition-colors bg-white overflow-hidden ${isOpen ? 'shadow-md border-brand-primary/30' : 'hover:border-brand-primary/50'}`}
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="font-serif text-lg font-medium text-brand-dark pr-8">{faq.question}</span>
                <span className="text-brand-primary shrink-0 transition-transform duration-300">
                  {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 pt-16 border-t border-border text-center bg-brand-soft/20 rounded-3xl p-10">
        <h2 className="text-2xl font-serif text-brand-dark font-medium mb-4">Still have questions?</h2>
        <p className="text-muted-foreground mb-8">We're here to help. Reach out to our customer support team.</p>
        <Button asChild variant="outline" className="h-12 border-brand-primary text-brand-dark hover:bg-brand-primary/10">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
