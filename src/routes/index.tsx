import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, PackageCheck, Sparkles } from "lucide-react";

import { Shop } from "@/components/Shop";
import { Button } from "@/components/ui/button";
import { UNIVERSITY_EMAIL_DOMAIN } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tuc Shop — Your Campus Grocery Store" },
      {
        name: "description",
        content:
          "Order snacks, beverages, stationery and toiletries from the campus store with live stock and in-store pickup.",
      },
      { property: "og:title", content: "Tuc Shop — Your Campus Grocery Store" },
      {
        property: "og:description",
        content: "Live inventory, online ordering and quick pickup for university students.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      <section className="surface-grid border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" />
            Open to @{UNIVERSITY_EMAIL_DOMAIN} students
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
            The campus store,
            <span className="block text-primary">without the queue.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Check what's actually on the shelf right now, pay online, and collect your bag at the
            counter between classes.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/shop">Start shopping</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/request">Request an item</Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: PackageCheck, title: "Live stock counts", text: "Updated the second someone buys." },
              { icon: Clock, title: "Pickup in minutes", text: "Skip the line, grab and go." },
              { icon: Sparkles, title: "Request anything", text: "We'll email you when it lands." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-4">
                <item.icon className="size-5 text-primary" />
                <p className="mt-3 font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">On the shelves today</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time inventory from the store counter.
        </p>
        <div className="mt-8">
          <Shop />
        </div>
      </section>
    </div>
  );
}
