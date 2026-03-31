import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-brand-soft/20 min-h-screen py-24 px-4">
      <div className="container max-w-6xl">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-dark mb-6 leading-tight">We'd love to hear from you.</h1>
          <p className="text-muted-foreground text-lg leading-relaxed text-balance">
            Whether you have a question about our products, shipping, returns, or just want to say hello, we are here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Details */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-serif text-brand-dark mb-8">Get in touch</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-primary/10">
                    <Mail className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-1">Email</h3>
                    <p className="text-muted-foreground mb-1 text-sm">Our friendly team is here to help.</p>
                    <a href="mailto:hello@tissu.ge" className="text-brand-primary hover:underline font-medium">hello@tissu.ge</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-primary/10">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-1">Office</h3>
                    <p className="text-muted-foreground mb-1 text-sm">Come say hello at our studio.</p>
                    <p className="text-brand-dark font-medium">Tbilisi, Georgia<br/>(Appointment Only)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-primary/10">
                    <Phone className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-1">Phone</h3>
                    <p className="text-muted-foreground mb-1 text-sm">Mon-Fri from 10am to 6pm.</p>
                    <a href="tel:+995500000000" className="text-brand-primary hover:underline font-medium">+995 5XX XXX XXX</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
              <h3 className="font-serif text-2xl font-medium text-brand-dark mb-4">Follow our journey</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Discover inspiration and behind-the-scenes glimpses of our crafting process on our social channels.
              </p>
              <div className="flex gap-4">
                <a href="#" className="h-10 px-4 rounded-full border border-border flex items-center text-sm font-medium hover:border-brand-primary hover:text-brand-primary transition-colors">Instagram</a>
                <a href="#" className="h-10 px-4 rounded-full border border-border flex items-center text-sm font-medium hover:border-brand-primary hover:text-brand-primary transition-colors">TikTok</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-brand-dark/5 border border-border">
            <h2 className="text-2xl font-serif text-brand-dark font-medium mb-6">Send a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">First name</label>
                  <Input placeholder="Anna" className="bg-brand-soft/20 h-12 border-transparent focus-visible:ring-brand-primary" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">Last name</label>
                  <Input placeholder="Smith" className="bg-brand-soft/20 h-12 border-transparent focus-visible:ring-brand-primary" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">Email</label>
                <Input type="email" placeholder="you@company.com" className="bg-brand-soft/20 h-12 border-transparent focus-visible:ring-brand-primary" required />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">Message</label>
                <textarea 
                  className="w-full flex min-h-[150px] rounded-xl border border-transparent bg-brand-soft/20 px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-colors resize-none" 
                  placeholder="How can we help?"
                  required
                />
              </div>

              <Button type="submit" variant="premium" className="w-full h-14 text-base shadow-lg">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
