"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { XCircle, ArrowLeft, MessageCircle, AlertTriangle } from "lucide-react";
import { Locale } from "@/i18n/config";

interface FailedClientProps {
  lang: Locale;
  dictionary: any;
}

export default function FailedClient({ lang, dictionary }: FailedClientProps) {
  return (
    <div className="bg-[#fcfbf9] min-h-screen py-16 px-4 flex flex-col items-center justify-center">
      <div className="container max-w-2xl mx-auto text-center">
        
        <div className="animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-destructive shadow-xl shadow-destructive/20 rounded-full flex items-center justify-center text-white mx-auto mb-8">
            <XCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-dark mb-4 tracking-tight">
            {dictionary.orderStatus.failed.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed mb-6">
            {dictionary.orderStatus.failed.subtitle}
          </p>
          
          <div className="bg-destructive/5 py-4 px-6 rounded-2xl flex items-center gap-3 w-fit mx-auto border border-destructive/10 mb-12">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-sm font-bold text-destructive">
              {dictionary.orderStatus.failed.reason} {lang === 'ka' ? 'ტრანზაქცია უარყოფილია ბანკის მიერ.' : 'Transaction declined by issuer.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild variant="premium" size="lg" className="h-16 px-10 rounded-2xl shadow-xl shadow-brand-dark/5 w-full sm:w-auto">
            <Link href={`/${lang}/checkout`} className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              {dictionary.orderStatus.failed.retry}
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl bg-white border-border/80 hover:bg-brand-soft/50 w-full sm:w-auto group">
            <Link href={`/${lang}/contact`} className="flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {dictionary.orderStatus.failed.support}
            </Link>
          </Button>
        </div>

        <p className="mt-12 text-xs font-medium text-muted-foreground">
          {lang === 'ka' ? 'გჭირდებათ დახმარება? მოგვწერეთ info@tissu.ge' : 'Need help? Email us at info@tissu.ge'}
        </p>

      </div>
    </div>
  );
}
