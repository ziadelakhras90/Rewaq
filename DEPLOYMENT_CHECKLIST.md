# Deployment Checklist — رِواق

هذه القائمة مخصصة لمرحلة ما قبل النشر الفعلي حتى تتأكد أن النسخة جاهزة تقنيًا وتشغيليًا.

## 1) مراجعة البيئة
### Next.js / Netlify
- [ ] إعداد `NEXT_PUBLIC_SUPABASE_URL`
- [ ] إعداد `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] إعداد `SUPABASE_SERVICE_ROLE_KEY` في بيئة السيرفر فقط
- [ ] مراجعة `NEXT_PUBLIC_APP_URL` إن كنت تستخدمه في metadata أو canonical لاحقًا

### Supabase Functions
- [ ] إعداد `SUPABASE_URL`
- [ ] إعداد `SUPABASE_SERVICE_ROLE_KEY`
- [ ] إعداد `APP_URL` على الدومين الفعلي
- [ ] إعداد `BREVO_API_KEY` إذا كنت تريد الإيميلات المعاملاتية

## 2) قاعدة البيانات
- [ ] التأكد من تطبيق جميع migrations من `001` إلى `022`
- [ ] التأكد من توليد `types/database.types.ts` بعد أي تعديل schema
- [ ] مراجعة RLS على الجداول الحساسة
- [ ] اختبار helper functions وRPCs الأساسية
- [ ] مراجعة `supabase/seed.sql` و`SEED_TEST_DATA_PLAN.md` قبل إنشاء بيانات اختبار

## 3) Edge Functions
- [ ] `create-order`
- [ ] `approve-seller`
- [ ] `reject-seller`
- [ ] `update-order-status`
- [ ] التأكد من وجود secrets اللازمة قبل النشر
- [ ] التأكد من أن روابط الإيميلات والإشعارات تستخدم `APP_URL` الصحيح

## 4) اختبارات smoke test قبل الإطلاق
### Customer flow
- [ ] تصفح المنتجات
- [ ] البحث والتصفية
- [ ] صفحة المنتج
- [ ] الإضافة للسلة
- [ ] checkout ناجح
- [ ] ظهور الطلب في `account/orders`
- [ ] فتح تفاصيل الطلب من صفحة النجاح ومن الحساب

### Seller flow
- [ ] تقديم طلب بائع
- [ ] ظهور الحالة pending / approved / rejected
- [ ] دخول البائع للوحة البائع بعد الموافقة
- [ ] إنشاء / تعديل / أرشفة منتج
- [ ] رؤية طلبات متجره فقط
- [ ] تحديث حالة الطلب من لوحة البائع

### Admin flow (عند اكتماله)
- [ ] مراجعة طلبات البائعين
- [ ] الموافقة / الرفض
- [ ] مراجعة الطلبات
- [ ] إدارة التصنيفات الأساسية

## 5) النشر
### Netlify
- [ ] Build command: `npm run build`
- [ ] Publish directory: الافتراضي لـ Next.js adapter / integration المعتمدة
- [ ] إضافة Environment Variables في Netlify
- [ ] اختبار Preview deployment قبل Production

### قبل الضغط على Publish
- [ ] `npm install`
- [ ] `npm run type-check`
- [ ] `npm run build`
- [ ] مراجعة عدم وجود imports مكسورة
- [ ] مراجعة middleware للمسارات الحساسة

## 6) بعد النشر
- [ ] إنشاء حساب عميل تجريبي
- [ ] إنشاء حساب بائع تجريبي
- [ ] تنفيذ طلب حقيقي تجريبي
- [ ] مراجعة notifications
- [ ] مراجعة الإيميلات المعاملاتية
- [ ] مراجعة الروابط المرسلة داخل الإيميلات

## 7) Rollback / Recovery
- [ ] حفظ نسخة من آخر zip/commit مستقر قبل النشر
- [ ] تحديد خطوة rollback لو فشل deployment
- [ ] حفظ نسخة من القيم البيئية خارج المنصة
- [ ] التأكد من وجود نسخة seed/test plan للبيانات التجريبية
