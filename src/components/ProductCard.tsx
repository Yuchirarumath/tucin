import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart";
import { formatCurrency, type Product } from "@/lib/shop";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const out = product.stock_quantity <= 0;
  const low = !out && product.stock_quantity <= 5;

  return (
    <Card className="flex h-full flex-col gap-3 overflow-hidden p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mt-0.5 text-base font-semibold leading-tight">{product.name}</h3>
        </div>
        <span className="font-display text-lg font-semibold text-primary">
          {formatCurrency(product.price)}
        </span>
      </div>

      {product.description ? (
        <p className="text-sm text-muted-foreground">{product.description}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        {out ? (
          <Badge variant="destructive">Out of Stock</Badge>
        ) : (
          <Badge variant={low ? "secondary" : "outline"}>
            {product.stock_quantity} in stock{low ? " · low" : ""}
          </Badge>
        )}
        <Button
          size="sm"
          disabled={out}
          onClick={() => {
            add(product);
            toast.success(`${product.name} added to cart`);
          }}
        >
          <Plus className="size-4" />
          Add to cart
        </Button>
      </div>
    </Card>
  );
}
