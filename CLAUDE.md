# Project Brief: Hydrus - The Self-Hostable Billing Platform

---
## 1. Vision
The goal is to build a **self-hostable, open-source billing platform**, not just an SDK. It will be built on Autumn's foundation but extended with a powerful **Admin Dashboard**. This dashboard will allow users to visually create and manage their pricing models—setting trials, defining subscription tiers, and configuring usage limits directly in the UI. The system will then automatically provision the corresponding products and prices in Stripe.

The end-user journey is a simple four-step process: **Set Keys, Decide Business Model (via UI), Integrate (via simple SDK functions), and Monitor.**

---
## 2. Technology Stack
* **Framework:** Next.js 14+ (App Router)
* **Language:** TypeScript
* **UI:** React, Tailwind CSS, Shadcn/UI
* **Forms:** React Hook Form & Zod
* **Payments & Billing Logic:** Stripe Node.js SDK
* **Database:** Serverless PostgreSQL (Neon)
* **ORM:** Prisma (with Prisma Accelerate for serverless connection pooling)
* **Email:** Resend
* **Unit & Integration Testing:** **Vitest**
* **End-to-End Testing:** **Playwright**

---
## 3. Project Directory Structure (Tree)

.
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── products/
│   │   │   │   └── route.ts
│   │   │   ├── cron/
│   │   │   │   └── check-churn/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts
│   ├── components/
│   │   ├── admin/
│   │   │   └── ProductForm.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── email.ts
│   │   ├── stripe.ts
│   │   └── utils.ts
│   └── middleware.ts
├── tests/
│   ├── e2e/
│   │   └── admin.spec.ts
│   └── unit/
│       └── lib/
│           └── billing-logic.test.ts
├── .env.example
├── package.json
└── vercel.json

---
## 4. Core Implementation: Admin Dashboard for Configurable Models

This is the central feature that delivers the project's unique value.

#### A. Frontend (`src/app/admin/products/new/page.tsx` & `src/components/admin/ProductForm.tsx`)
1.  **Build a Form:** Use Shadcn/UI, React Hook Form, and Zod for a validated, type-safe form.
2.  **Form Fields:** The form must include fields to define a complete pricing model:
    * `Product Name`: Text input (e.g., "Pro Tier").
    * `Model Type`: Dropdown (`Standard Subscription`, `Usage-Based with Prepaid Credits`).
    * `Price`: Number input (e.g., `25.00`).
    * `Currency`: Select (`USD`, `EUR`).
    * `Billing Interval`: Select (`Monthly`, `Yearly`).
    * `Trial Period`: Number input (e.g., `14` for 14 days).

#### B. Backend API (`src/app/api/products/route.ts`)
1.  **Create an Endpoint:** This `POST` endpoint receives the validated form data.
2.  **Stripe Interaction:** The API route will use the Stripe SDK to:
    * Call `stripe.products.create()` with the Product Name.
    * Call `stripe.prices.create()` with the correct parameters based on the `Model Type`.
3.  **Database Sync:** After successfully creating the Product and Price in Stripe, save their IDs (`prod_...`, `price_...`) and configuration details into your own `Product` table in your Postgres database.

---
## 5. Security & PCI Compliance
The entire security strategy is built on one rule: **the system will never touch, process, or store raw credit card information.**
* **Frontend:** All payment forms will be rendered using **Stripe Elements** or **Stripe Checkout**. These are secure `<iframe>` components hosted by Stripe, ensuring that sensitive card data is sent directly from the user's browser to Stripe's servers.
* **Backend:** The backend will only ever handle non-sensitive identifiers, such as Stripe Customer IDs (`cus_...`) and single-use payment tokens. This approach offloads the vast majority of the PCI compliance burden to Stripe.

---
## 6. Testing Strategy

#### A. Unit Tests (Vitest)
* **Target:** Small, pure functions in `src/lib/`.
* **Example:** Test a function that formats currency, ensuring `formatCurrency(1000, 'USD')` returns `"$10.00"`.

#### B. Integration Tests (Vitest)
* **Target:** API endpoints, mocking the database and external services.
* **Example:** Test the `/api/webhooks/stripe` route by mocking a Stripe event and asserting that the correct database changes and email functions are called.

#### C. End-to-End Tests (Playwright)
* **Target:** Critical user flows in a real browser.
* **Example:** Automate logging in as an admin, navigating to `/admin/products/new`, filling out the Product Form, submitting it, and asserting that the new product appears in the list.

---
## 7. Business Model Context: Open-Core
The platform will operate on an **open-core model**.
* **Open-Source Version (Free):** The entire codebase is available on GitHub for users to self-host and manage. This drives adoption and community building.
* **Commercial Version (Paid):** A managed, hosted cloud offering can be sold to customers who want the platform's power without the operational overhead of managing their own infrastructure. The development should ensure the codebase is easily deployable for both scenarios.