import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/shop";

export const productsQueryKey = ["products"];

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, category, stock_quantity, image_url")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row, price: Number(row.price) }));
}

/** Products with live stock: any inventory change is pushed to every open tab. */
export function useProducts() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: productsQueryKey, queryFn: fetchProducts });

  useEffect(() => {
    const channel = supabase
      .channel("products-stock")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        queryClient.invalidateQueries({ queryKey: productsQueryKey });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
