import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES } from "@/lib/shop";

export function Shop() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products ?? []).filter((product) => {
      const matchCategory = category === "All" || product.category === category;
      const matchTerm =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description ?? "").toLowerCase().includes(term);
      return matchCategory && matchTerm;
    });
  }, [products, search, category]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chips, pens, cold drinks…"
            className="pl-9"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((item) => (
          <Button
            key={item}
            size="sm"
            variant={category === item ? "default" : "outline"}
            onClick={() => setCategory(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing matches that search. Try another term, or request the item.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
