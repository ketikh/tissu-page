import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-20 bg-brand-soft/20">
      <div className="w-full max-w-sm space-y-8 bg-card p-10 rounded-3xl shadow-xl shadow-brand-dark/5 border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-brand-dark font-medium">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Enter your details to access your account</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-dark">Email</label>
              <Input type="email" placeholder="hello@example.com" required className="h-12" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-brand-dark">Password</label>
                <Link href="/account/forgot-password" className="text-xs text-brand-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input type="password" placeholder="••••••••" required className="h-12" />
            </div>
          </div>

          <Button type="submit" variant="premium" className="w-full h-12 text-base">
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          <span className="mr-1">Don't have an account?</span>
          <Link href="/account/register" className="text-brand-primary font-medium hover:underline hover:text-brand-dark transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
