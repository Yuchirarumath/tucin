import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/staff-login")({
  head: () => ({
    meta: [
      { title: "Employee Portal — Tuckin" },
      {
        name: "description",
        content: "Secure staff login for Tuckin inventory, orders and student requests.",
      },
      { property: "og:title", content: "Employee Portal — Tuckin" },
      {
        property: "og:description",
        content: "Store employees sign in here to manage inventory and pickup orders.",
      },
    ],
  }),
  component: StaffLogin,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (!(roles ?? []).some((row) => row.role === "admin")) {
        await supabase.auth.signOut();
        toast.error("This account does not have staff access.");
        return;
      }
      toast.success("Signed in to the staff dashboard");
      navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Card className="p-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold">Employee portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff accounts only. Student logins will be rejected here.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-email">Work email</Label>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-password">Password</Label>
            <Input
              id="staff-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button className="w-full" disabled={busy} onClick={signIn}>
            Sign in to dashboard
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Student?{" "}
          <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
            Go to student sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
