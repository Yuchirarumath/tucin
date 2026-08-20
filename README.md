# Tuc Shop Express

Please build a full-stack web application for a university grocery store called "Tuc Shop". The app needs a modern, clean UI (using Tailwind CSS) and a robust backend (using Supabase for authentication, database, and real-time updates). 

Here are the complete project requirements categorized by functionality:

# 1. Authentication & User Roles
Implement Role-Based Access Control (RBAC) with two main roles:
*   **Students/Users:** Can only register and log in using a specific university email domain (e.g., must end in `@youruniversity.edu`). 
*   **Admins/Employees:** Have a secure, separate login portal to access the backend dashboard. 

# 2. Database Schema (Supabase)
Please set up the necessary tables with Row Level Security (RLS). I will need the following tables:
*   **Products:** id, name, description, price, category, stock_quantity, image_url.
*   **Users:** id, email, role (admin/user).
*   **Orders:** id, user_id, total_amount, status (pending/paid/ready for pickup/completed), created_at.
*   **Order_Items:** id, order_id, product_id, quantity.
*   **Product_Requests:** id, user_id, requested_item_name, status (pending/fulfilled), user_email.

# 3. Customer-Facing Storefront (User View)
*   **Live Inventory & Categories:** Display all available products categorized intuitively (e.g., Snacks, Beverages, Stationery, Toiletries). Include a search bar and category filters.
*   **Stock Visibility:** Every product card must clearly show the exact `stock_quantity` available in real-time. If stock is 0, show it as "Out of Stock" and disable the "Add to Cart" button.
*   **Cart & Checkout:** Users can add items to a cart. Checkout should feature an "Order Online & Pickup in Store" flow.
*   **Payments:** Integrate a Stripe checkout flow (in test mode) for online payments before the order is confirmed.
*   **Product Requests:** A dedicated page or modal where users can type in the name of a product they want the store to carry. 

# 4. Admin/Employee Dashboard (Restricted Access)
*   **Inventory Management:** Admins can add, edit, or delete products, update categories, and manually adjust stock.
*   **Order Management:** View incoming online orders, mark them as "Ready for Pickup", and mark them as "Completed" once the student picks them up.
*   **Request Management:** View a list of student product requests. When an admin marks a request as "Fulfilled" (meaning the item is now in stock), it should trigger an automated email to the user who requested it.

# 5. Automation & Real-Time Features
*   **Automatic Inventory Deduction:** Upon successful payment, the system must automatically deduct the purchased quantities from the `Products` table inventory.
*   **Real-time Updates:** Use Supabase Realtime so that if one student buys the last bag of chips, the stock goes to 0 instantly on all other users' screens without needing a page refresh.
*   **Email Notifications:** Use a service like Resend or Supabase Edge Functions to automatically send an email to a user when their requested product is added to the store's inventory.

# 6. UI/UX Design Guidelines
*   Make the design mobile-responsive, as most students will use their phones.
*   Use a modern, approachable color palette fitting for a university campus store. 
*   Include a clean navigation bar with: Home, Shop by Category, My Cart, Request an Item, and User Profile/Orders.

Please generate the foundational components, database types, and UI for this application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tucin.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d9b7f8ad-45a2-4bf3-bf13-a954161cac55).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
