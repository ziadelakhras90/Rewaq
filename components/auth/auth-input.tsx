// components/auth/auth-input.tsx
// حقل إدخال مُعاد استخدامه في صفحات Auth

interface AuthInputProps {
  label:         string
  name:          string
  type?:         string
  value:         string
  onChange:      (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?:  string
  required?:     boolean
  error?:        string
  autoComplete?: string
  dir?:          string
  suffix?:       React.ReactNode   // لزر show/hide كلمة المرور
}

export function AuthInput({
  label, name, type = 'text', value, onChange,
  placeholder, required, error, autoComplete, dir, suffix,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ms-0.5 text-rose-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          dir={dir}
          className={`
            w-full rounded-xl border px-4 py-3 text-sm transition
            placeholder:text-stone-400 focus:outline-none focus:ring-2
            ${suffix ? 'pe-11' : ''}
            ${error
              ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-400/20'
              : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:bg-white focus:ring-amber-400/20'
            }
          `}
        />
        {suffix && (
          <div className="absolute inset-y-0 end-0 flex items-center pe-3">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
