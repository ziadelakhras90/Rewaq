/** @type {import('next').NextConfig} */
const nextConfig = {
  // السماح للصور من Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Netlify Edge runtime compatibility
  // لا نفعّل output: 'export' لأننا نستخدم Server Components + Route Handlers
}

export default nextConfig
