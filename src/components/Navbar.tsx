import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/request", label: "Request an Item" },
  { to: "/orders", label: "My Orders" },
] as const;

export function Navbar() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { count } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          activeProps={{ className: "bg-secondary text-secondary-foreground" }}
          activeOptions={{ exact: link.to === "/" }}
        >
          {link.label}
        </Link>
      ))}
      {isAdmin ? (
        <Link
          to="/admin"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
        >
          Dashboard
        </Link>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBag className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Tuckin</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">{nav}</nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="relative">
            <Link to="/cart">
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 ? (
                <Badge className="absolute -right-2 -top-2 size-5 justify-center rounded-full p-0 text-[11px]">
                  {count}
                </Badge>
              ) : null}
            </Link>
          </Button>

          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-10 flex flex-col gap-1">{nav}</div>
              {user ? (
                <p className="mt-6 px-3 text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
