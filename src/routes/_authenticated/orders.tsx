import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, ORDER_STATUS_LABELS } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Tuckin" },
      {
        name: "description",
        content: "Track your Tuckin pickup orders from paid to ready for collection.",
      },
      { property: "og:title", content: "My Orders — Tuckin" },
      {
        property: "og:description",
        content: "See order status and pickup readiness for your campus store purchases.",
      },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();

  const orders = useQuery({
    queryKey: ["orders", "mine", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at, order_items(quantity, unit_price, products(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">My orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Signed in as {user?.email}. Show your order ID at the counter.
      </p>

      <div className="mt-8 space-y-3">
        {orders.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        ) : (orders.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          orders.data!.map((order) => (
            <Card key={order.id} className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === "completed"
                      ? "outline"
                      : order.status === "ready_for_pickup"
                        ? "default"
                        : "secondary"
                  }
                >
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>

              <ul className="space-y-1 text-sm">
                {order.order_items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.products?.name ?? "Item"}
                    </span>
                    <span>{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between border-t border-border pt-3 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total_amount))}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
