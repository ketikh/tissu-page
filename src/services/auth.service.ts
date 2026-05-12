import { createClient } from "@/lib/supabase/client";
import { User, Address } from "@/lib/types";

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  private getSupabase() {
    return createClient();
  }

  async login(credentials: { email: string; password: string }): Promise<{ user: User }> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("invalid") || msg.includes("credentials")) {
        throw new Error("ემაილი ან პაროლი არასწორია");
      }
      if (msg.includes("email not confirmed")) {
        throw new Error("ჯერ დაადასტურე ემაილი");
      }
      throw new Error(error.message);
    }

    // Try to fetch the full profile. If cookies haven't synced to the server
    // yet, retry once after a short delay. If it still fails, fall back to a
    // minimal user built from the supabase auth response so login still
    // succeeds — the full profile can load on next request.
    try {
      const profile = await this.fetchProfile();
      return { user: profile };
    } catch {
      await new Promise(r => setTimeout(r, 250));
      try {
        const profile = await this.fetchProfile();
        return { user: profile };
      } catch {
        const authUser = data?.user;
        const meta = authUser?.user_metadata || {};
        const fallback: User = {
          id: authUser?.id || "",
          email: authUser?.email || credentials.email,
          firstName: meta.first_name || meta.full_name?.split(" ")[0] || "",
          lastName: meta.last_name || meta.full_name?.split(" ").slice(1).join(" ") || "",
          addresses: [],
          orders: [],
        };
        return { user: fallback };
      }
    }
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ user: User }> {
    // Server creates user AND signs in (sets session cookies)
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || "Registration failed");
    }

    // Sync browser client with new session from cookies
    const supabase = this.getSupabase();
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    const profile = await this.fetchProfile();
    return { user: profile };
  }

  async loginWithGoogle(): Promise<void> {
    const supabase = this.getSupabase();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    const supabase = this.getSupabase();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/account/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  async resetPassword(password: string): Promise<boolean> {
    const supabase = this.getSupabase();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  async fetchProfile(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: "Failed to fetch profile" }));
      throw new Error(data.error || "Failed to fetch profile");
    }

    return response.json();
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || "Failed to update profile");
    }
    return resData;
  }

  async addAddress(address: Omit<Address, "id">): Promise<Address> {
    const response = await fetch(`${this.baseUrl}/auth/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to add address");
    }
    return data;
  }

  async removeAddress(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/addresses?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to remove address");
    }
  }

  async setAddressAsDefault(id: string): Promise<Address> {
    const response = await fetch(`${this.baseUrl}/auth/addresses`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isDefault: true }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to set default address");
    }
    return data;
  }

  async logout(): Promise<void> {
    const supabase = this.getSupabase();
    await supabase.auth.signOut();
  }
}

export const authService = new AuthService();
