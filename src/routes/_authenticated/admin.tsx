import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIsAdmin } from "@/hooks/use-auth";
import { productsQueryKey, useProducts } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, formatCurrency, ORDER_STATUS_LABELS, type Product } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard — Tuc Shop" },
      {
        name: "description",
        content: "Manage Tuc Shop inventory, pickup orders and student product requests.",
      },
      { property: "og:title", content: "Staff Dashboard — Tuc Shop" },
      {
        property: "og:description",
        content: "Inventory, order fulfilment and request management for store employees.",
      },
    ],
  }),
  component: AdminPage,
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  description: z.string().trim().max(300).optional(),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().trim().min(1),
  stock_quantity: z.number().int().min(0, "Stock cannot be negative"),
});

function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) return <p className="p-10 text-center text-sm text-muted-foreground">Checking access…</p>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Staff access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account isn't an employee account.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Staff dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Inventory, pickup orders and student requests.
      </p>

      <Tabs defaultValue="inventory" className="mt-8">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-6">
          <InventoryTab />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <RequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductDialog({ product }: { product?: Product }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: String(product?.price ?? ""),
    category: product?.category ?? CATEGORIES[0],
    stock_quantity: String(product?.stock_quantity ?? "0"),
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = productSchema.safeParse({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock_quantity: Number(form.stock_quantity),
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid product");

      const payload = {
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        category: parsed.data.category,
        stock_quantity: parsed.data.stock_quantity,
      };

      const { error } = product
        ? await supabase.from("products").update(payload).eq("id", product.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(product ? "Product updated" : "Product added");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button size="icon" variant="ghost" aria-label={`Edit ${product.name}`}>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="size-4" /> Add product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Price</Label>
              <Input
                id="p-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-stock">Stock</Label>
              <Input
                id="p-stock"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(event) => setForm({ ...form, stock_quantity: event.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) => setForm({ ...form, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InventoryTab() {
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();

  const adjust = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: Math.max(0, stock) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productsQueryKey }),
    onError: (error: Error) => toast.error(error.message),
  });

  const removeProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      void queryClient.invalidateQueries({ queryKey: productsQueryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ProductDialog />
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading inventory…</p>
      ) : (
        (products ?? []).map((product) => (
          <Card key={product.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.category} · {formatCurrency(product.price)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjust.mutate({ id: product.id, stock: product.stock_quantity - 1 })}
              >
                −
              </Button>
              <span className="w-14 text-center text-sm font-medium">
                {product.stock_quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjust.mutate({ id: product.id, stock: product.stock_quantity + 1 })}
              >
                +
              </Button>
            </div>
            <ProductDialog product={product} />
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Delete ${product.name}`}
              onClick={() => removeProduct.mutate(product.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}

function OrdersTab() {
  const queryClient = useQueryClient();
  const orders = useQuery({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at, user_id, order_items(quantity, products(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order updated");
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (orders.isLoading) return <p className="text-sm text-muted-foreground">Loading orders…</p>;
  if ((orders.data ?? []).length === 0)
    return <p className="text-sm text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.data!.map((order) => (
        <Card key={order.id} className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString()} ·{" "}
                {formatCurrency(Number(order.total_amount))}
              </p>
            </div>
            <Badge>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
          </div>
          <ul className="text-sm text-muted-foreground">
            {order.order_items.map((item, index) => (
              <li key={index}>
                {item.quantity} × {item.products?.name ?? "Item"}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={order.status !== "paid"}
              onClick={() => setStatus.mutate({ id: order.id, status: "ready_for_pickup" })}
            >
              Mark ready for pickup
            </Button>
            <Button
              size="sm"
              disabled={order.status === "completed"}
              onClick={() => setStatus.mutate({ id: order.id, status: "completed" })}
            >
              Mark completed
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RequestsTab() {
  const queryClient = useQueryClient();
  const requests = useQuery({
    queryKey: ["product_requests", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_requests")
        .select("id, requested_item_name, note, status, user_email, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const fulfil = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_requests")
        .update({ status: "fulfilled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request marked fulfilled");
      void queryClient.invalidateQueries({ queryKey: ["product_requests"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (requests.isLoading) return <p className="text-sm text-muted-foreground">Loading requests…</p>;
  if ((requests.data ?? []).length === 0)
    return <p className="text-sm text-muted-foreground">No student requests yet.</p>;

  return (
    <div className="space-y-3">
      {requests.data!.map((request) => (
        <Card key={request.id} className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{request.requested_item_name}</p>
            <p className="text-sm text-muted-foreground">{request.user_email}</p>
            {request.note ? (
              <p className="text-sm text-muted-foreground">{request.note}</p>
            ) : null}
          </div>
          <Badge variant={request.status === "fulfilled" ? "default" : "secondary"}>
            {request.status}
          </Badge>
          <Button
            size="sm"
            disabled={request.status === "fulfilled"}
            onClick={() => fulfil.mutate(request.id)}
          >
            Mark fulfilled
          </Button>
        </Card>
      ))}
    </div>
  );
}
