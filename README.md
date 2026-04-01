# رِواق

منصة Marketplace عربية متعددة البائعين (Multi-vendor) مبنية كـ MVP عملي باستخدام Next.js + Supabase + Brevo.

## ما الذي تم إنجازه
- عرض المنتجات والبحث والتصفية
- صفحة تفاصيل المنتج
- السلة وCheckout وصفحة النجاح
- حساب العميل: العناوين + الطلبات + تفاصيل الطلب
- تقديم البائع ولوحة البائع الأساسية
- قاعدة بيانات Supabase كاملة مع RLS وEdge Functions
- توحيد النصوص العربية والحالات الأساسية في الواجهة
- حزمة إعداد وتشغيل واختبار أولية

## الـ Stack
- Next.js 15
- React 18
- TypeScript
- Supabase (Auth / Postgres / Storage / Edge Functions)
- Brevo للإيميلات المعاملاتية
- Netlify للنشر

## التشغيل المحلي
### 1) تثبيت الحزم
```bash
npm install
```

### 2) إنشاء ملف البيئة
انسخ `.env.example` إلى `.env.local` ثم ضع القيم الصحيحة:
```bash
cp .env.example .env.local
```

### 3) تشغيل الواجهة
```bash
npm run dev
```

الموقع سيفتح غالبًا على:
```text
http://localhost:3000
```

## متغيرات البيئة الأساسية
### Next.js
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (للاستخدامات الخلفية فقط، لا تضعه في الواجهة)

### Supabase Edge Functions
ضع هذه القيم في بيئة Supabase Functions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BREVO_API_KEY`
- `APP_URL`

> ارجع إلى `ENVIRONMENT_REFERENCE.md` لشرح أوضح لكل متغير ومكان وضعه.

## أوامر مفيدة
```bash
npm run dev
npm run build
npm run start
npm run type-check
npm run db:types
npm run db:reset
npm run db:push
npm run functions:serve
```

## بنية مختصرة للمشروع
```text
app/
  (public)/        الصفحات العامة
  (customer)/      صفحات العميل
  (seller)/        صفحات البائع
components/
  account/
  cart/
  catalog/
  checkout/
  product/
  seller/
services/
  cart.service.ts
  catalog.service.ts
  order.service.ts
  address.service.ts
  seller.service.ts
  seller-products.service.ts
  seller-orders.service.ts
supabase/
  migrations/
  functions/
```

## ملفات مرجعية مهمة
- `UI_COPY_GUIDE.md` — توحيد النصوص والحالات العربية
- `QA_CHECKLIST.md` — قائمة اختبار شاملة
- `DEPLOYMENT_CHECKLIST.md` — Checklist ما قبل النشر
- `ENVIRONMENT_REFERENCE.md` — مرجع متغيرات البيئة
- `LAUNCH_REVIEW.md` — مراجعة منطقية مختصرة للحالة الحالية
- `SEED_TEST_DATA_PLAN.md` — خطة بيانات الاختبار والحسابات التجريبية

## ملاحظات مهمة
- المشروع مبني على مبدأ: **single-vendor per active cart**
- إنشاء الطلب يتم **server-side فقط** عبر Edge Function `create-order`
- المنتجات العامة تظهر فقط إذا كان المنتج والمتجر في حالة نشطة
- لا تحذف منتجًا دخل في طلبات سابقة؛ قم بأرشفته فقط

## المرحلة التالية المقترحة
- Admin moderation pages
- تحسينات UI/UX خفيفة بعد اكتمال صفحات الأدمن
- مرور اختباري شامل قبل الإطلاق
