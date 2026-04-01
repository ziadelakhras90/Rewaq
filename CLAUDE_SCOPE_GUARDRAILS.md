# Claude Scope & Guardrails

## Build only
- Admin dashboard
- Seller applications review
- Sellers list
- Orders list and order details
- Categories basic CRUD

## Reuse only
- Existing edge functions
- Existing services patterns
- Existing route protection patterns
- Existing Arabic UI style and labels

## Do not touch unless required
- Customer catalog flow
- Product details flow
- Cart / checkout / success
- Customer account pages
- Seller onboarding and seller workspace
- Existing migrations and edge functions logic

## Do not introduce
- New architecture
- New dashboards outside admin phase
- Overengineered abstractions
- Feature creep
- Unnecessary state libraries
- New database migrations unless a real blocking gap exists
