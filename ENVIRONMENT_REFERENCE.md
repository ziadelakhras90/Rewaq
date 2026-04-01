# Environment Reference — رِواق

هذا الملف يوضح متغيرات البيئة المطلوبة في المشروع، أين توضع، ولماذا نحتاجها.

## 1) متغيرات تطبيق Next.js
تُحفظ محليًا في `.env.local`، وفي بيئات النشر مثل Netlify.

### `NEXT_PUBLIC_SUPABASE_URL`
- **المكان:** `.env.local` + Netlify
- **الاستخدام:** إنشاء Supabase client على الواجهة والسيرفر
- **مثال:** `https://xyzcompany.supabase.co`

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **المكان:** `.env.local` + Netlify
- **الاستخدام:** قراءة/كتابة الواجهة ضمن صلاحيات RLS
- **تنبيه:** هذا المفتاح public بطبيعته لكن صلاحياته مضبوطة عبر RLS

### `SUPABASE_SERVICE_ROLE_KEY`
- **المكان:** بيئة السيرفر فقط
- **الاستخدام:** عمليات خلفية آمنة مثل server-only helpers أو أي منطق إداري داخلي
- **تحذير:** لا تضعه أبدًا في أي Client Component أو bundle عام

### `NEXT_PUBLIC_APP_URL`
- **المكان:** اختياري في `.env.local` + Netlify
- **الاستخدام:** مفيد لاحقًا في metadata أو canonical URLs أو redirects العامة

## 2) متغيرات Supabase Edge Functions
تُحفظ في Supabase Secrets، وليس في `.env.local` الخاص بتطبيق Next.

### `SUPABASE_URL`
- **الاستخدام:** إنشاء admin client داخل Edge Functions

### `SUPABASE_SERVICE_ROLE_KEY`
- **الاستخدام:** تنفيذ العمليات الخلفية الحساسة داخل Edge Functions

### `APP_URL`
- **الاستخدام:** إنشاء روابط صحيحة داخل الإيميلات والإشعارات
- **مثال محلي:** `http://localhost:3000`
- **مثال إنتاج:** `https://riwaq.example.com`

### `BREVO_API_KEY`
- **الاستخدام:** إرسال الإيميلات المعاملاتية
- **ملاحظة:** إذا لم يوجد، المشروع لن يتوقف لكن الإيميلات لن تُرسل

## 3) أين تضع كل متغير؟
| المتغير | `.env.local` | Netlify | Supabase Secrets |
|---|---|---:|---:|
| `NEXT_PUBLIC_SUPABASE_URL` | نعم | نعم | لا |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | نعم | نعم | لا |
| `SUPABASE_SERVICE_ROLE_KEY` | حسب الحاجة السيرفرية فقط | نعم | نعم |
| `NEXT_PUBLIC_APP_URL` | اختياري | اختياري | لا |
| `SUPABASE_URL` | لا | لا | نعم |
| `APP_URL` | لا | لا | نعم |
| `BREVO_API_KEY` | لا | لا | نعم |

## 4) أقل إعداد مطلوب للتطوير المحلي
### لتشغيل الواجهة فقط
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### لتشغيل كل المشروع مع الوظائف الخلفية
- المتغيران السابقان
- `SUPABASE_SERVICE_ROLE_KEY` عند الحاجة في السيرفر
- داخل Supabase functions secrets:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `APP_URL`
  - `BREVO_API_KEY` (اختياري)

## 5) أخطاء شائعة
- وضع `SUPABASE_SERVICE_ROLE_KEY` في كود client-side
- نسيان ضبط `APP_URL` فينتج عنه روابط إيميل خاطئة
- تشغيل الواجهة على مشروع Supabase مختلف عن المشروع الذي نُشرت عليه الـ functions
