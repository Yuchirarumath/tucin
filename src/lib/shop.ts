export const UNIVERSITY_EMAIL_DOMAIN = "bmu.edu.in";

export const CATEGORIES = ["Snacks", "Beverages", "Stationery", "Toiletries"] as const;

export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock_quantity: number;
  image_url: string | null;
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid",
  ready_for_pickup: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function isUniversityEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${UNIVERSITY_EMAIL_DOMAIN}`);
}
