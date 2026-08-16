import { createFileRoute } from "@tanstack/react-router";

import { Shop } from "@/components/Shop";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Snacks, Drinks & Stationery — Tuc Shop" },
      {
        name: "description",
        content:
          "Browse live campus store inventory by category. Real-time stock counts, order online and pick up in store.",
      },
      { property: "og:title", content: "Shop Snacks, Drinks & Stationery — Tuc Shop" },
      {
        property: "og:description",
        content: "Live inventory from your university grocery store, updated in real time.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Shop by category</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Stock counts update live — no refresh needed.
      </p>
      <div className="mt-8">
        <Shop />
      </div>
    </div>
  );
}
