# Supabase reset password template fix

المشكلة: روابط إعادة تعيين كلمة المرور التي تعتمد على `code` قد تفشل عندما يفتح المستخدم الرابط من متصفح مختلف، أو عندما يمر الرابط عبر tracking / preview.

## المطلوب في Supabase Dashboard
اذهب إلى:

- Authentication
- Email Templates
- Reset Password

واجعل زر أو رابط إعادة التعيين يستخدم هذا الشكل:

```text
https://rewaq.netlify.app/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password
```

## لماذا؟
- صفحة `app/(auth)/auth/callback/page.tsx` تدعم `verifyOtp` عبر `token_hash`.
- هذا المسار أكثر ثباتًا من الاعتماد على `code` في سيناريو reset password.

## بعد التعديل
1. احفظ القالب في Supabase.
2. اطلب Reset Password جديد.
3. تأكد أن الرابط في الإيميل يحتوي على `token_hash` و `type=recovery`.
4. اختبر فتح الرابط من الهاتف والمتصفح العادي.
