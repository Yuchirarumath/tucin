import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/request")({
  head: () => ({
    meta: [
      { title: "Request an Item — tucin" },
      {
        name: "description",
        content: "Tell the campus store which product to stock next and get notified when it lands.",
      },
      { property: "og:title", content: "Request an Item — tucin" },
      {
        property: "og:description",
        content: "Suggest products for tucin to carry and track your request status.",
      },
    ],
  }),
  component: RequestPage,
});

const schema = z.object({
  requested_item_name: z.string().trim().min(2, "Tell us the item name").max(120),
  note: z.string().trim().max(500).optional(),
});

function RequestPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const requests = useQuery({
    queryKey: ["product_requests", "mine", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_requests")
        .select("id, requested_item_name, note, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ requested_item_name: name, note });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const { error } = await supabase.from("product_requests").insert({
        user_id: user!.id,
        user_email: user!.email ?? "",
        requested_item_name: parsed.data.requested_item_name,
        note: parsed.data.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      setNote("");
      toast.success("Request sent to the store team");
      void queryClient.invalidateQueries({ queryKey: ["product_requests"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Request an item</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Can't find something? Ask the store to stock it — we'll notify you when it arrives.
      </p>

      <Card className="mt-8 space-y-4 p-5">
        <div className="space-y-1.5">
          <Label htmlFor="item">Product name</Label>
          <Input
            id="item"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Protein bars"
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Anything else? (optional)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Brand, flavour, size…"
            maxLength={500}
          />
        </div>
        <Button disabled={submit.isPending} onClick={() => submit.mutate()}>
          {submit.isPending ? "Sending…" : "Send request"}
        </Button>
      </Card>

      <h2 className="mt-10 text-lg font-semibold">Your requests</h2>
      <div className="mt-3 space-y-2">
        {(requests.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          requests.data!.map((request) => (
            <Card key={request.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{request.requested_item_name}</p>
                {request.note ? (
                  <p className="text-sm text-muted-foreground">{request.note}</p>
                ) : null}
              </div>
              <Badge variant={request.status === "fulfilled" ? "default" : "secondary"}>
                {request.status === "fulfilled" ? "Now in stock" : "Pending"}
              </Badge>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
