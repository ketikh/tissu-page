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
      throw new Error(error.message);
    }

    // Fetch profile data from our API
    const profile = await this.fetchProfile();
    return { user: profile };
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ user: User }> {
    const supabase = this.getSupabase();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Create profile record in our DB
    const response = await fetch(`${this.baseUrl}/auth/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
      }),
    });

    if (!response.ok) {
      const resData = await response.json();
      throw new Error(resData.error || "Failed to create profile");
    }

    const profile = await response.json();
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
    const response = await fetch(`${this.baseUrl}/auth/profile`);

    if (!response.ok) {
      const data = await response.json();
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
