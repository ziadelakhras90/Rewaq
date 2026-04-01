# Claude Handoff Packet — Riwaq v6

## Source of truth
This repository state is the latest approved source of truth for **رِواق**.
Do not start from scratch. Continue from the existing codebase only.

## Project summary
Riwaq is an Arabic multi-vendor marketplace MVP built with:
- Next.js App Router
- Supabase (Postgres, Auth, Storage, RLS, Edge Functions)
- Netlify
- Brevo

## Completed areas
### Foundation
- Supabase migrations `001` → `022`
- RLS helpers and policies
- Indexes and updated_at triggers
- Edge functions:
  - `create-order`
  - `approve-seller`
  - `reject-seller`
  - `update-order-status`

### Customer flow
- Marketplace listing
- Product details
- Cart
- Checkout
- Success page
- Account addresses
- Account orders
- Order details

### Seller flow
- Become seller
- Seller application status
- Seller dashboard shell
- Seller products
- Seller orders
- Seller settings

### Project docs already added
- `README.md`
- `.env.example`
- `DEPLOYMENT_CHECKLIST.md`
- `UI_COPY_GUIDE.md`
- `QA_CHECKLIST.md`
- `ENVIRONMENT_REFERENCE.md`
- `LAUNCH_REVIEW.md`
- `SEED_TEST_DATA_PLAN.md`

## Confirmed architectural decisions
1. `user_roles` is separate from `profiles`
2. `seller_applications.status = pending | approved | rejected`
3. `stores.status = active | suspended | closed`
4. MVP = **single-vendor per order**
5. Active cart is single-vendor and includes `store_id`
6. `carts.status = active | checked_out | abandoned`
7. Public products only show when:
   - `products.status = 'active'`
   - `stores.status = 'active'`
8. Order creation is **server-side only** via `create-order`
9. Use existing helper functions and backend flows; do not invent a parallel flow
10. `store_addresses` is postponed in MVP
11. Product deletion is restricted by order history; archive if already used in orders

## Important fixes already applied
- Order tracking links use `order_number`, not `order_id`
- Seller order notification links also use `order_number`
- Arabic labels/statuses were unified in `lib/utils/arabic.ts`
- Seller stats links now match actual supported filters

## Current focus
Build **Admin Moderation Pages only**.

## Out of scope
Do **not** do any of the following in this phase:
- Home page
- UI redesign
- New architecture proposals
- Payments integration
- Reviews, coupons, wishlists, chat
- Analytics beyond simple admin counters
- New migrations unless absolutely required by a real gap
- Refactoring unrelated customer/seller flows

## Admin phase target routes
- `app/(admin)/admin/page.tsx`
- `app/(admin)/admin/seller-applications/page.tsx`
- `app/(admin)/admin/sellers/page.tsx`
- `app/(admin)/admin/orders/page.tsx`
- `app/(admin)/admin/orders/[orderNumber]/page.tsx`
- `app/(admin)/admin/categories/page.tsx`

## Allowed additions
- `components/admin/*`
- `services/admin.service.ts`
- Small route/auth/type fixes strictly required for admin pages

## Response format required from Claude
1. Current audit
2. Gap analysis
3. Files created/updated
4. Brief notes
5. File tree
6. Testing checklist
