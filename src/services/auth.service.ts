import { User, LoginCredentials, RegisterData, Address } from "@/lib/types";

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Invalid credentials");
    }
    
    return data;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || "Registration failed");
    }
    
    return resData;
  }

  async loginWithGoogle(credential: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Google login failed");
    }
    
    return data;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to send reset email");
    }
    return true;
  }

  async resetPassword(token: string, password: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to reset password");
    }
    return true;
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
    console.log("AuthService: logging out...");
    // Clear cookies client side is handled by store
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export const authService = new AuthService();
