import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { productsQueryKey } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "My Cart — Tuc Shop" },
      {
        name: "description",
        content: "Review your campus store basket and place an order online for in-store pickup.",
      },
      { property: "og:title", content: "My Cart — Tuc Shop" },
      {
        property: "og:description",
        content: "Order online and pick up your items at the Tuc Shop counter.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQuantity, remove, clear, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (!user) {
      toast.error("Sign in with your university email to place an order");
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("place_order", {
        _items: lines.map((line) => ({ product_id: line.product_id, quantity: line.quantity })),
      });
      if (error) throw error;
      clear();
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast.success("Order placed! We'll have it ready at the counter.");
      navigate({ to: "/orders", search: { placed: String(data ?? "") } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">My cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Order online, then pick up in store — no queue.
      </p>

      {lines.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Browse the shop</Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {lines.map((line) => (
            <Card key={line.product_id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{line.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(line.price)} each
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(line.product_id, line.quantity - 1)}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(line.product_id, line.quantity + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <span className="w-20 text-right font-medium">
                {formatCurrency(line.price * line.quantity)}
              </span>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remove item"
                onClick={() => remove(line.product_id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </Card>
          ))}

          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button size="lg" disabled={busy} onClick={checkout}>
              {busy ? "Placing order…" : "Order online & pick up in store"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Stock is reserved and deducted the moment your order is confirmed.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
