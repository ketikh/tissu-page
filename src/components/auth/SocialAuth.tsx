"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleOAuthProvider, CredentialResponse, GoogleLogin } from '@react-oauth/google';

interface SocialAuthProps {
  lang: string;
  dictionary: any;
  className?: string;
}

export function SocialAuth({ dictionary, className }: SocialAuthProps) {
  const { loginWithGoogle, isLoading } = useAuthStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground font-medium tracking-widest">
            {dictionary.auth?.social?.or || "Or continue with"}
          </span>
        </div>
      </div>

      <div className="flex justify-center w-full relative">
        {isGoogleLoading || isLoading ? (
          <div className="h-[44px] flex items-center justify-center w-full border rounded-xl border-border/60">
             <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          </div>
        ) : (
          <div className="w-full flex justify-center [&>div]:w-full transition-opacity">
            <GoogleLogin
               onSuccess={handleGoogleSuccess}
               onError={() => console.log("Google Login Failed")}
               useOneTap
               theme="outline"
               size="large"
               width="100%"
               shape="rectangular"
            />
          </div>
        )}
      </div>
    </div>
  );
}

