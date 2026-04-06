import { getDictionary } from "@/i18n/getDictionary";
import { Locale } from "@/i18n/config";
import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  const contactDetails = [
    {
      icon: Mail,
      title: dictionary.contact.details.email.title,
      value: "hello@tissu.ge",
      tagline: dictionary.contact.details.email.tagline,
    },
    {
      icon: MapPin,
      title: dictionary.contact.details.office.title,
      value: dictionary.contact.details.office.address,
      tagline: dictionary.contact.details.office.tagline,
    },
    {
      icon: Phone,
      title: dictionary.contact.details.phone.title,
      value: "+995 5XX XXX XXX",
      tagline: dictionary.contact.details.phone.tagline,
    },
  ];

  return (
    <div className="bg-brand-soft/20 min-h-screen">
      <div className="container px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-start">
            {/* Contact Info */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-serif text-brand-dark leading-tight">
                  {dictionary.contact.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {dictionary.contact.subtitle}
                </p>
              </div>

              <div className="space-y-8">
                {contactDetails.map((detail, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center shrink-0">
                      <detail.icon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg text-brand-dark">{detail.title}</h3>
                      <p className="text-brand-primary font-medium">{detail.value}</p>
                      <p className="text-xs text-muted-foreground">{detail.tagline}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12 border-t border-brand-primary/20">
                <h3 className="font-serif text-xl text-brand-dark mb-4">{dictionary.contact.social.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {dictionary.contact.social.subtitle}
                </p>
                <div className="flex gap-4">
                  {["Instagram", "Facebook", "Pinterest"].map((social) => (
                    <Button key={social} variant="outline" size="sm" className="rounded-full px-6 bg-white border-brand-primary/10 hover:bg-brand-primary/5">
                      {social}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-brand-dark/5 border border-border relative overflow-hidden">
               {/* Aesthetic Decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                    <h2 className="text-2xl font-serif text-brand-dark">{dictionary.contact.form.title}</h2>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-brand-dark">{dictionary.contact.form.firstName}</label>
                        <Input placeholder={dictionary.contact.form.placeholder.firstName} className="h-12 bg-brand-soft/10 border-transparent focus:bg-white focus:border-brand-primary/30 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-brand-dark">{dictionary.contact.form.lastName}</label>
                        <Input placeholder={dictionary.contact.form.placeholder.lastName} className="h-12 bg-brand-soft/10 border-transparent focus:bg-white focus:border-brand-primary/30 transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-brand-dark">{dictionary.contact.form.email}</label>
                      <Input type="email" placeholder="anna.smith@example.com" className="h-12 bg-brand-soft/10 border-transparent focus:bg-white focus:border-brand-primary/30 transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-brand-dark">{dictionary.contact.form.message}</label>
                      <Textarea 
                        placeholder={dictionary.contact.form.placeholder.message} 
                        className="min-h-[150px] bg-brand-soft/10 border-transparent focus:bg-white focus:border-brand-primary/30 transition-all" 
                      />
                    </div>

                    <Button type="submit" variant="premium" className="w-full h-14 text-base shadow-lg shadow-brand-primary/20">
                      {dictionary.contact.form.send}
                    </Button>
                  </form>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
