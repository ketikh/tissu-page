"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Clock, 
  Truck,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/utils";
import { useStoreHydration } from "@/store/useHydration";
import Image from "next/image";

interface AccountClientProps {
  dictionary: any;
  lang: Locale;
}

type Tab = "overview" | "orders" | "addresses" | "wishlist" | "settings";

export default function AccountClient({ dictionary, lang }: AccountClientProps) {
  const hydrated = useStoreHydration();
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile, addAddress, removeAddress, setAddressAsDefault, refreshProfile, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      setProfileChecked(true);
      return;
    }
    // No user in store — try to fetch from server (OAuth callback case)
    refreshProfile().finally(() => {
      setProfileChecked(true);
    });
  }, [hydrated, user, refreshProfile]);

  useEffect(() => {
    if (profileChecked && !useAuthStore.getState().user) {
      router.push(`/${lang}/account/login`);
    }
  }, [profileChecked, router, lang]);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-soft/20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", icon: UserIcon, label: dictionary.account.sidebar.profile },
    { id: "orders", icon: Package, label: dictionary.account.sidebar.orders },
    { id: "addresses", icon: MapPin, label: dictionary.account.sidebar.addresses },
    { id: "wishlist", icon: Heart, label: dictionary.account.sidebar.wishlist },
    { id: "settings", icon: Settings, label: dictionary.account.sidebar.settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push(`/${lang}`);
  };

  return (
    <div className="bg-brand-soft/20 min-h-screen py-12">
      <div className="container px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-dark">{dictionary.account.title}</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full" />
            {lang === 'ka' ? "ონლაინ" : "Online"}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-2">
            <nav className="bg-white rounded-2xl shadow-sm border border-border p-2 sticky top-24">
              {sidebarItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id 
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" 
                      : "text-muted-foreground hover:bg-brand-soft hover:text-brand-dark"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-border my-2 mx-4" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {dictionary.account.sidebar.logout}
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "overview" && <OverviewTab user={user} dictionary={dictionary} lang={lang} onEdit={() => setActiveTab("settings")} />}
            {activeTab === "orders" && <OrdersTab user={user} dictionary={dictionary} lang={lang} />}
            {activeTab === "addresses" && (
              <AddressesTab 
                user={user} 
                dictionary={dictionary} 
                lang={lang} 
                onAdd={addAddress} 
                onRemove={removeAddress} 
                onSetDefault={setAddressAsDefault} 
                isLoading={isLoading}
              />
            )}
            {activeTab === "settings" && <SettingsTab user={user} dictionary={dictionary} lang={lang} onUpdate={updateProfile} isLoading={isLoading} />}
            {(activeTab === "wishlist") && (
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-border text-center space-y-4">
                <div className="w-16 h-16 bg-brand-soft rounded-full flex items-center justify-center text-brand-primary mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif text-brand-dark">{dictionary.account.sidebar.wishlist}</h3>
                <p className="text-muted-foreground">Your wishlist is currently empty.</p>
                <Button asChild variant="outline">
                  <Link href={`/${lang}/shop`}>Explore Store</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function OverviewTab({ user, dictionary, lang, onEdit }: { user: any, dictionary: any, lang: Locale, onEdit: () => void }) {
  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-border flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary text-2xl font-serif border border-brand-primary/20">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <h2 className="text-2xl font-serif text-brand-dark">{dictionary.account.welcome}, {user.firstName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button onClick={onEdit} variant="outline" className="rounded-full border-brand-primary/20 h-11 px-6 font-medium bg-white hover:bg-brand-soft">
          {dictionary.account.edit}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Order */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-brand-dark">{dictionary.account.recentOrder}</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-brand-dark">Order #TS-8291</p>
                <p className="text-xs text-muted-foreground mt-1">{dictionary.account.placed} Feb 12, 2024</p>
              </div>
              <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                {dictionary.account.processing}
              </span>
            </div>
            
            <div className="flex items-center gap-4 bg-brand-soft/30 p-4 rounded-2xl border border-brand-primary/5">
              <div className="w-12 h-12 bg-white rounded-lg border border-border p-1 relative overflow-hidden">
                <Image src="/sleeve1.jpg" alt="Product" fill className="object-cover opacity-80" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-dark line-clamp-1">The Soft Wrap Sleeve</p>
                <p className="text-xs text-muted-foreground">Oat / 14-inch</p>
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-xl gap-2 h-11 border-brand-primary/10 hover:bg-brand-soft">
              <Clock className="w-4 h-4" />
              {dictionary.account.track}
            </Button>
          </div>
        </div>

        {/* Default Address */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif text-brand-dark">{dictionary.account.defaultShipping}</h3>
          </div>

          <div className="space-y-4">
            {user.addresses.find((a: any) => a.isDefault) ? (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="text-sm text-brand-dark/80 leading-relaxed">
                  <p className="font-semibold text-brand-dark">{user.firstName} {user.lastName}</p>
                  <p>{user.addresses.find((a: any) => a.isDefault).streetAddress}</p>
                  <p>{user.addresses.find((a: any) => a.isDefault).city}, Georgia</p>
                  <p className="mt-2 text-muted-foreground">{user.addresses.find((a: any) => a.isDefault).phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No default address saved.</p>
            )}

            <div className="pt-4 border-t border-border flex items-center gap-3">
              <Truck className="w-5 h-5 text-brand-primary shrink-0 opacity-50" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Fastest shipping method will be automatically selected based on your default location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ user, dictionary, lang }: { user: any, dictionary: any, lang: Locale }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
      <div className="p-8 border-b border-border">
        <h2 className="text-2xl font-serif text-brand-dark">{dictionary.account.orders.title}</h2>
      </div>
      
      <div className="p-0">
        {user.orders.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-brand-soft/50 rounded-full flex items-center justify-center text-muted-foreground mx-auto">
              <Package className="w-10 h-10" />
            </div>
            <p className="text-muted-foreground">{dictionary.account.orders.empty}</p>
            <Button asChild variant="premium">
              <Link href={`/${lang}/shop`}>Browse Shop</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-soft/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-8 py-4">{dictionary.account.orders.orderNo}</th>
                  <th className="px-8 py-4">{dictionary.account.orders.date}</th>
                  <th className="px-8 py-4">{dictionary.account.orders.status}</th>
                  <th className="px-8 py-4 text-right">{dictionary.account.orders.total}</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {user.orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-brand-soft/10 transition-colors group">
                    <td className="px-8 py-6 font-semibold text-brand-dark">{order.id}</td>
                    <td className="px-8 py-6 text-sm text-muted-foreground">{order.date}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-medium">{formatPrice(order.total)}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-brand-primary hover:underline text-sm font-medium">
                        {dictionary.account.orders.details}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AddressesTab({ user, dictionary, lang, onAdd, onRemove, onSetDefault, isLoading }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    streetAddress: "",
    city: "Tbilisi",
    phone: user.phone || "",
    isDefault: user.addresses.length === 0
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await onAdd(newAddr);
    setShowAddForm(false);
    setNewAddr({ ...newAddr, streetAddress: "", isDefault: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-brand-dark">{dictionary.account.addresses.title}</h2>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm" variant="premium" className="rounded-full gap-2">
            <Plus className="w-4 h-4" /> {dictionary.account.addresses.add}
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-brand-primary/20 animate-in slide-in-from-top-4 duration-300">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder={dictionary.checkout.firstName} 
                  required 
                  value={newAddr.firstName} 
                  onChange={(e) => setNewAddr({...newAddr, firstName: e.target.value})}
                />
                <Input 
                  placeholder={dictionary.checkout.lastName} 
                  required 
                  value={newAddr.lastName}
                  onChange={(e) => setNewAddr({...newAddr, lastName: e.target.value})}
                />
              </div>
              <Input 
                placeholder={dictionary.checkout.street} 
                required 
                value={newAddr.streetAddress}
                onChange={(e) => setNewAddr({...newAddr, streetAddress: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder={dictionary.checkout.city} 
                  required 
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                />
                <Input 
                  placeholder={dictionary.checkout.phone} 
                  required 
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({...newAddr, phone: e.target.value})}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                 <input 
                   type="checkbox" 
                   checked={newAddr.isDefault} 
                   onChange={(e) => setNewAddr({...newAddr, isDefault: e.target.checked})}
                   className="w-4 h-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                 />
                 <span className="text-sm text-muted-foreground group-hover:text-brand-dark transition-colors">Set as default address</span>
              </label>
              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  {dictionary.common.cancel}
                </Button>
                <Button type="submit" variant="premium" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : dictionary.common.save}
                </Button>
              </div>
           </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {user.addresses.map((addr: any) => (
          <div key={addr.id} className={`bg-white rounded-3xl p-8 shadow-sm border transition-all duration-300 ${addr.isDefault ? 'border-brand-primary ring-1 ring-brand-primary/10' : 'border-border hover:border-brand-primary/30'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${addr.isDefault ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-soft text-muted-foreground'}`}>
                <MapPin className="w-4 h-4" />
              </div>
              {addr.isDefault && (
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary px-2 py-1 bg-brand-primary/5 rounded-full">
                  {dictionary.account.addresses.default}
                </span>
              )}
            </div>
            
            <div className="space-y-1 mb-8">
              <h4 className="font-semibold text-brand-dark">{addr.firstName} {addr.lastName}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{addr.streetAddress}</p>
              <p className="text-sm text-muted-foreground">{addr.city}, Georgia</p>
              <p className="text-sm text-brand-primary font-medium mt-2">{addr.phone}</p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              {!addr.isDefault && (
                <button 
                  onClick={() => onSetDefault(addr.id)}
                  className="text-xs font-semibold text-muted-foreground hover:text-brand-primary transition-colors"
                >
                  {dictionary.account.addresses.setAsDefault}
                </button>
              )}
              <button 
                onClick={() => onRemove(addr.id)}
                className="text-xs font-semibold text-destructive/70 hover:text-destructive flex items-center gap-1 transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {dictionary.common.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {user.addresses.length === 0 && !showAddForm && (
        <div className="bg-white rounded-3xl p-16 shadow-sm border border-border text-center space-y-4">
          <p className="text-muted-foreground">{dictionary.account.addresses.empty}</p>
          <Button onClick={() => setShowAddForm(true)} variant="outline">
            Add Your First Address
          </Button>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ user, dictionary, onUpdate, isLoading }: any) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await onUpdate(formData);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
      <div className="p-8 border-b border-border bg-brand-soft/10">
        <h2 className="text-2xl font-serif text-brand-dark">{dictionary.account.profile.title}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-dark">{dictionary.account.profile.firstName}</label>
            <Input 
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-dark">{dictionary.account.profile.lastName}</label>
            <Input 
              value={formData.lastName} 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-dark">{dictionary.account.profile.email}</label>
            <Input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-brand-dark">{dictionary.account.profile.phone}</label>
            <Input 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+995 5XX XXX XXX"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4">
          <Button type="submit" variant="premium" className="px-10 h-12" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : dictionary.account.profile.update}
          </Button>
          
          {isSuccess && (
            <div className="flex items-center gap-2 text-success text-sm font-medium animate-in fade-in slide-in-from-left-2">
              <Check className="w-4 h-4" />
              {dictionary.common.success}
            </div>
          )}
        </div>
      </form>

      <div className="p-8 bg-brand-soft/10 border-t border-border">
        <h3 className="text-lg font-serif text-brand-dark mb-4">Password & Security</h3>
        <p className="text-sm text-muted-foreground mb-6">Manage your account password and security settings.</p>
        <Button variant="outline" className="rounded-full border-brand-primary/20 bg-white">
          Change Password
        </Button>
      </div>
    </div>
  );
}

// Ensure Link works
import Link from "next/link";
