"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { mockProducts } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/useCartStore";
import { useUIStore } from "@/store/useUIStore";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, ShieldCheck, Truck, RefreshCw, Star } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  
  const product = mockProducts.find((p) => p.id === unwrappedParams.id);
  
  if (!product) {
    notFound();
  }

  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity);
      openCart();
    }
  };

  // Group variants by size to show color options inside them or vice-versa
  // For simplicity, we'll just list colors for the selected size, and sizes available
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));
  const uniqueColorsForCurrentSize = product.variants.filter(v => v.size === selectedVariant.size);

  return (
    <div className="container px-4 py-8 md:py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] md:aspect-square bg-muted rounded-2xl overflow-hidden shadow-sm">
            <Image 
              src={product.images[activeImage] || "/placeholder.jpg"} 
              alt={product.name} 
              fill 
              className="object-cover transition-opacity duration-300" 
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${activeImage === idx ? "border-brand-primary" : "border-transparent"} hover:border-brand-primary/50`}
              >
                <Image src={img || "/placeholder.jpg"} alt={product.name} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-brand-dark tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{product.subtitle}</p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-medium text-brand-dark">
                {formatPrice(selectedVariant?.price || product.price)}
              </span>
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-brand-primary">
                  <Star className="w-4 h-4 fill-current" />
                  <span>5.0 ({product.reviews.length} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-border mb-8" />

          {/* Selectors */}
          <div className="space-y-6 mb-10">
            {/* Size Selector */}
            {uniqueSizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-brand-dark">Size</label>
                  <button className="text-xs text-muted-foreground underline hover:text-brand-primary">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uniqueSizes.map((size) => {
                    // find a variant that matches this size
                    const variant = product.variants.find(v => v.size === size);
                    const isSelected = selectedVariant.size === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedVariantId(variant?.id || "")}
                        className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected 
                            ? "border-brand-primary bg-brand-primary/5 text-brand-dark" 
                            : "border-border hover:border-brand-primary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {uniqueColorsForCurrentSize.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-brand-dark">
                  Color: <span className="font-normal text-muted-foreground ml-1">{selectedVariant.color}</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {uniqueColorsForCurrentSize.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`w-10 h-10 rounded-full border-[3px] transition-transform ${
                          isSelected ? "scale-110 border-brand-primary shadow-md" : "border-transparent shadow-sm hover:scale-110"
                        }`}
                        style={{ backgroundColor: v.colorCode }}
                        title={v.color}
                        disabled={!v.inStock}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-brand-dark">Quantity</label>
              <div className="flex items-center border border-border rounded-lg w-max h-12 bg-card">
                <button 
                  className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-l-lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-r-lg"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              variant="premium" 
              className="w-full h-14 text-base tracking-wide"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full h-14 text-base tracking-wide bg-brand-soft border-brand-primary/20 hover:bg-brand-primary/10"
            >
              Buy it now
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Free shipping on orders over {formatPrice(300)}
            </p>
          </div>

          {/* Collapsible Info like Description / Care */}
          <div className="mt-12 space-y-6">
            <div>
              <h3 className="text-lg font-serif font-medium border-b border-border pb-2 mb-4">Product Details</h3>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                {product.description}
              </p>
              <ul className="mt-4 space-y-2 list-disc pl-5 text-sm text-brand-dark/80 marker:text-brand-primary">
                {product.materials.map((mat, i) => <li key={i}>{mat}</li>)}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-serif font-medium border-b border-border pb-2 mb-4">Care Instructions</h3>
              <ul className="space-y-2 list-disc pl-5 text-sm text-brand-dark/80 marker:text-brand-primary">
                {product.careInstructions.map((care, i) => <li key={i}>{care}</li>)}
              </ul>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-dark">Premium Quality</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="w-6 h-6 text-brand-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-dark">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RefreshCw className="w-6 h-6 text-brand-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-dark">14-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
