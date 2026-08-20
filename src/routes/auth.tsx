import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { UNIVERSITY_EMAIL_DOMAIN, isUniversityEmail } from "@/lib/shop";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student Sign In — tucin" },
      {
        name: "description",
        content: `Sign in with your @${UNIVERSITY_EMAIL_DOMAIN} email to shop campus snacks, drinks and stationery.`,
      },
      { property: "og:title", content: "Student Sign In — tucin" },
      {
        property: "og:description",
        content: "Campus store access for students with a university email address.",
      },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  fullName: z.string().trim().max(80).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function submit(mode: "signin" | "signup") {
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    if (!isUniversityEmail(parsed.data.email)) {
      toast.error(`Students must use their @${UNIVERSITY_EMAIL_DOMAIN} email address`);
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: parsed.data.fullName ?? "" },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate({ to: "/shop" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Student access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only <span className="font-medium text-foreground">@{UNIVERSITY_EMAIL_DOMAIN}</span>{" "}
          addresses can shop at tucin.
        </p>

        <Tabs defaultValue="signin" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          {(["signin", "signup"] as const).map((mode) => (
            <TabsContent key={mode} value={mode} className="mt-4 space-y-4">
              {mode === "signup" ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`${mode}-name`}>Full name</Label>
                  <Input
                    id={`${mode}-name`}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Aarav Sharma"
                  />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor={`${mode}-email`}>University email</Label>
                <Input
                  id={`${mode}-email`}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={`you@${UNIVERSITY_EMAIL_DOMAIN}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${mode}-password`}>Password</Label>
                <Input
                  id={`${mode}-password`}
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={() => submit(mode)}>
                {mode === "signup" ? "Create student account" : "Sign in"}
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Staff member?{" "}
          <Link to="/staff-login" className="font-medium text-primary underline-offset-4 hover:underline">
            Use the employee portal
          </Link>
        </p>
      </Card>
    </div>
  );
}
