# Admin Phase Definition of Done

The phase is considered done only if all of the following are true:

## Dashboard
- Admin dashboard route renders successfully
- KPI cards show real data
- Recent seller applications and recent orders are visible

## Seller applications
- Admin can list applications by status
- Admin can inspect application/store information
- Admin can approve a pending seller using existing backend flow
- Admin can reject a pending seller using existing backend flow
- UI feedback is clear after approve/reject

## Sellers
- Admin can list all sellers/stores
- Seller/store status is visible
- Basic filters work

## Orders
- Admin can list all orders
- Filters for status/store/date work
- Admin can open order details route
- Order details show snapshots, not live product assumptions
- Status history is visible

## Categories
- Admin can create category
- Admin can edit category
- Admin can archive/disable category if that matches schema best
- No unnecessary advanced category management added

## Technical
- Arabic RTL UI is preserved
- Existing flows are not broken
- No unnecessary migrations were introduced
- No route mismatches or broken imports remain
