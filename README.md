# MahairaSystem

**Sri Manikanta Paints, Iron & Hardware** — a unified web app with a public store website **and** a login-protected owner revenue-management dashboard, in one React + Vite project deployed to one URL.

Built for the Aurora Institute of Technology Industry Internship 2025–26.

---

## What's inside

| Layer | Who sees it | Pages |
| --- | --- | --- |
| **Public website** | Everyone, no login | Home, Products (live catalogue), About, Contact |
| **Owner dashboard** | Store owner only (login) | Dashboard, Inventory, Customers, Bills, New Bill, Reports |

**Tech stack:** React 18 · Vite · React Router v6 · Tailwind CSS v3 · Supabase (Postgres + Auth + Storage) · Recharts · jsPDF · deployed on Vercel.

---

## Prerequisites

- **Node.js 18+** (tested on Node 24) and npm
- A free **[Supabase](https://supabase.com)** account
- A free **[Vercel](https://vercel.com)** account (for deployment)

---

## Quick start

```bash
npm install        # install dependencies
cp .env.example .env   # then fill in your Supabase keys (see below)
npm run dev        # start the dev server → http://localhost:5173
```

> The app **runs without Supabase** — you'll see "not connected" notices and empty states. Connect Supabase (next section) to load real data and enable login.

Other scripts:

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

---

## Connect Supabase

### 1. Create the project
Create a new project at [supabase.com](https://supabase.com). Wait for it to finish provisioning.

### 2. Run the database setup
Open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates all tables (`products`, `customers`, `bills`, `bill_items`, `payments`), enables Row Level Security with the correct policies, and inserts a few sample products.

### 3. Create the product-images storage bucket
**Storage → New bucket** → name it exactly `product-images` and mark it **Public**. Then under **Storage → Policies** for that bucket:
- Add a **public read** policy (Supabase has a one-click "Allow public read access" template).
- Add an **insert/update/delete** policy allowing `authenticated` users.

### 4. Create the owner login account
There is **no signup page** by design. Create the owner manually: **Authentication → Users → Add user**, enter an email + password, and tick **Auto Confirm User**. Use these credentials at `/owner/login`.

### 5. Add your keys to `.env`
Find these under **Settings → API**:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Restart `npm run dev` after editing `.env`.

### Optional store details (`.env`)
These are public-facing and safe to commit. Leave blank to use built-in placeholders.

```env
VITE_STORE_PHONE=+91 90000 00000
VITE_STORE_WHATSAPP=919000000000        # digits only, with country code
VITE_STORE_ADDRESS=Shop No. 00, Main Road, Hyderabad
VITE_STORE_GST=36XXXXXXXXXXXXX
VITE_STORE_MAPS_EMBED=https://www.google.com/maps?q=YOUR+STORE&output=embed
```

---

## Project structure

```
src/
├── components/
│   ├── public/    Navbar, Hero, CategoryGrid, BrandStrip, WhatsAppCTA, Testimonials, Footer, ProductCard, AnnouncementBanner
│   ├── owner/     Sidebar, KpiCard, PageHeader, ProductForm, CustomerForm, CustomerHistory, BillDetail
│   ├── shared/    StatusBadge, EmptyState, ConfirmDialog, icons
│   └── ui/        Button, Input, Card, Badge, Dialog, DataTable, SearchSelect, Tabs, Switch, Alert, Skeleton
├── pages/
│   ├── public/    Home, Products, About, Contact
│   └── owner/     Login, Dashboard, Inventory, Customers, Bills, NewBill, Reports
├── layouts/       PublicLayout, OwnerLayout
├── context/       AuthContext, ToastContext
├── hooks/         useAuth, useProducts
├── lib/           supabase, utils, categories, pdf
├── App.jsx        routes
└── main.jsx
supabase/schema.sql   ← run this in Supabase SQL editor
```

---

## How the product sync works

The public `/products` page fetches **live from Supabase on every load** (no static data, no caching that blocks updates). When the owner adds, edits, or soft-deletes a product in **Inventory**, the change appears for customers on their next page load. Deletes are **soft** (`is_active = false`) so existing bill history stays intact.

---

## Billing notes

- Subtotal, GST, and grand total are computed with rounding helpers (`round2`) so money math is always precise to 2 decimals.
- Generating a bill: inserts the bill + line items (with name/price **snapshots**), decrements product stock, records a payment if marked Paid, and downloads a **PDF invoice** (jsPDF).
- Bills unpaid for **more than 30 days** are automatically marked **Overdue**.

---

## Deploy to Vercel

1. Push this repo to GitHub (`.env` is already git-ignored — never commit it).
2. In Vercel, **Import** the repo. Framework preset: **Vite**. Build command `npm run build`, output dir `dist` (auto-detected; `vercel.json` already handles SPA routing).
3. Add the env vars in **Vercel → Settings → Environment Variables**:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (plus any optional store vars).
4. Deploy. Then in **Supabase → Authentication → URL Configuration → Redirect URLs**, add `https://your-app.vercel.app/**`.

---

## Demo checklist

**Public:** Home loads all sections · `/products` shows live products · category filter works · WhatsApp opens the right number · Maps shows on Contact · mobile layout works.

**Owner:** login works · add product (with image) → appears on public `/products` · edit/soft-delete reflects publicly · add customer · generate bill → PDF downloads · mark bill paid · dashboard KPIs accurate · reports charts correct · logout redirects to login · protected routes redirect when logged out.
