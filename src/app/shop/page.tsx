"use client";

import { useSearchParams } from "next/navigation";
import { mockProducts } from "@/lib/mock-data";
import { ProductCard } from "@/components/product/ProductCard";
import { Suspense } from "react";
import { Filter, SlidersHorizontal, ChevronDown } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");

  let filteredProducts = [...mockProducts];

  // Filtering
  if (categoryParam && categoryParam !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.category === categoryParam);
  }

  // Sorting
  if (sortParam === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortParam === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortParam === "featured") {
    filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-serif text-brand-dark font-medium capitalize mt-6">
            {categoryParam ? categoryParam.replace("-", " ") : "All Products"}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg text-balance">
            Explore our meticulously crafted collection of textile goods.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex w-full md:w-auto items-center gap-4 justify-between md:justify-end">
          <button className="md:hidden flex items-center gap-2 text-sm font-medium hover:text-brand-primary">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:inline-block">Sort by:</span>
            <div className="relative">
              <select 
                className="h-10 pl-3 pr-8 rounded-md bg-transparent border-none text-sm focus:ring-0 cursor-pointer appearance-none font-medium hover:text-brand-primary transition-colors"
                defaultValue={sortParam || "featured"}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                <option value="featured">Featured</option>
                <option value="new">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-64 hidden lg:block flex-shrink-0 space-y-10">
          <div>
            <h3 className="font-semibold mb-4 text-brand-dark">Categories</h3>
            <ul className="space-y-3">
              {[
                { label: "All Products", val: "all" },
                { label: "Laptop Sleeves", val: "laptop-sleeves" },
                { label: "Pouches & Accessories", val: "pouches" }
              ].map((cat) => (
                <li key={cat.val}>
                  <button 
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set("category", cat.val);
                      window.location.href = url.toString();
                    }}
                    className={`text-sm hover:text-brand-primary transition-colors ${
                      (categoryParam === cat.val) || (!categoryParam && cat.val === "all")
                        ? "text-brand-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-brand-dark">Color Palette</h3>
            <div className="flex flex-wrap gap-3">
              {['#e6e0d8', '#3a3632', '#c4a991'].map((color) => (
                <button 
                  key={color} 
                  className="w-6 h-6 rounded-full border border-border shadow-sm hover:scale-110 transition-transform focus-ring"
                  style={{ backgroundColor: color }}
                  aria-label={`Color filter ${color}`}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-brand-dark">Size</h3>
            <div className="grid grid-cols-2 gap-2">
              {['13-inch', '14-inch', '15-inch', '16-inch'].map((size) => (
                <label key={size} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-input flex items-center justify-center group-hover:border-brand-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">{size}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <SlidersHorizontal className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No products match your filters.</p>
              <button 
                className="text-brand-primary underline mt-4"
                onClick={() => window.location.href = "/shop"}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container py-32 text-center text-muted-foreground animate-pulse">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
