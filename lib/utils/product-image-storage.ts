import { createClient } from '@/lib/supabase/client'

const PRODUCT_IMAGES_BUCKET = 'product-images'
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export async function uploadProductImage(file: File) {
  if (!file.type.startsWith('image/')) {
    return { success: false as const, error: 'الملف المختار يجب أن يكون صورة.' }
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { success: false as const, error: 'حجم الصورة يجب ألا يتجاوز 5MB.' }
  }

  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false as const, error: 'تعذر التحقق من المستخدم الحالي.' }
  }

  const originalName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '') || 'image'
  const filePath = `${user.id}/${Date.now()}-${originalName}`

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return { success: false as const, error: uploadError.message }
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(filePath)

  return {
    success: true as const,
    publicUrl: data.publicUrl,
    filePath,
  }
}
