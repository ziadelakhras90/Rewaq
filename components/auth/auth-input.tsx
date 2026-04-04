interface AuthInputProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  autoComplete?: string
  dir?: string
  suffix?: React.ReactNode
  disabled?: boolean
}

export function AuthInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  autoComplete,
  dir,
  suffix,
  disabled,
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
          disabled={disabled}
          className={[
            'w-full rounded-xl border px-4 py-3 text-sm transition placeholder:text-stone-400 focus:outline-none focus:ring-2',
            suffix ? 'pe-11' : '',
            disabled ? 'cursor-not-allowed opacity-60' : '',
            error
              ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-400/20'
              : 'border-stone-200 bg-stone-50 focus:border-amber-400 focus:bg-white focus:ring-amber-400/20',
          ].join(' ')}
        />
        {suffix && <div className="absolute inset-y-0 end-0 flex items-center pe-3">{suffix}</div>}
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
