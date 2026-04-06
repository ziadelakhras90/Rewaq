const DEFAULT_APP_URL = 'http://localhost:3000'

function normalizeUrl(value?: string | null): string {
  const raw = value?.trim()
  if (!raw) return DEFAULT_APP_URL

  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)
      ? `http://${raw}`
      : `https://${raw}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return DEFAULT_APP_URL
  }
}

function getConfiguredUrl(): string {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      process.env.NETLIFY_URL ||
      DEFAULT_APP_URL
  )
}

export function getServerAppUrl(): string {
  return getConfiguredUrl()
}

export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return getServerAppUrl()
}
