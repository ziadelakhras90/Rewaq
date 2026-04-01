# Supabase Setup — رِواق | Riwaq

هذا الملف يثبت إعداد Supabase الخاص بالمشروع بصيغة عملية ومطابقة لهيكل MVP الحالي.

## 1) متطلبات المشروع
استخدم مشروع Supabase واحد فقط يخدم:
- Postgres
- Auth
- Storage
- RLS
- Edge Functions

ولا نستخدم أي microservices أو بنية موازية خارج ذلك.

## 2) ربط المشروع محليًا
بعد تثبيت Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

## 3) تشغيل Supabase محليًا
```bash
supabase start
supabase db reset
```

## 4) تطبيق قاعدة البيانات على المشروع السحابي
لو القاعدة جديدة:
```bash
supabase db push
```

ولو أردت فقط توليد الأنواع بعد التحقق من المخطط:
```bash
supabase gen types typescript --linked > types/database.types.ts
```

## 5) متغيرات Next.js
ضع هذه القيم في `.env.local` وبيئة Netlify:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 6) Secrets الخاصة بـ Edge Functions
اضبطها داخل Supabase Secrets:

```bash
supabase secrets set \
  SUPABASE_URL=YOUR_SUPABASE_URL \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
  APP_URL=https://your-domain.com \
  BREVO_API_KEY=YOUR_BREVO_KEY
```

## 7) نشر Edge Functions المطلوبة
```bash
supabase functions deploy create-order
supabase functions deploy approve-seller
supabase functions deploy reject-seller
supabase functions deploy update-order-status
```

## 8) إعدادات Auth المطلوبة
في Supabase Dashboard:
- Site URL = رابط الموقع الفعلي
- Redirect URLs يجب أن تشمل:
  - `http://localhost:3000`
  - رابط Netlify preview
  - رابط الإنتاج النهائي

## 9) ملاحظات مرتبطة بالمشروع
- إنشاء الطلب يتم فقط عبر Edge Function `create-order`
- العمليات الإدارية الحساسة تعتمد على `service_role`
- الواجهة العامة يجب أن تعمل بمفتاح `anon` فقط مع RLS
- لا تستخدم `SUPABASE_SERVICE_ROLE_KEY` داخل أي Client Component

## 10) التحقق النهائي
بعد ضبط البيئة:
```bash
npm run type-check
npm run build
```

ولو غيّرت المايجريشن أو الـ schema:
```bash
supabase db push
supabase gen types typescript --linked > types/database.types.ts
```
