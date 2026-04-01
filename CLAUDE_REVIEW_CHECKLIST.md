# Post-Claude Review Checklist

## Imports and routes
- No broken imports
- Route groups are used correctly
- Admin pages are protected correctly

## Data wiring
- Admin pages read real data from current schema
- No mock data left behind
- Approve/reject actions use existing backend flow
- Categories page respects current schema fields

## Non-regression
- Customer flow still works
- Seller flow still works
- No existing pages were rewritten unnecessarily

## UI
- Arabic labels are consistent
- RTL layout is intact
- Empty/error/loading states exist where needed

## Logic
- Order detail pages use snapshots correctly
- Seller applications status handling is correct
- Sellers list reflects current store/application states correctly
- Filters actually map to supported query params or service filters
