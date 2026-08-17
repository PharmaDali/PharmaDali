import React from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  hidden?: boolean
  className?: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  labelClassName?: string
  options?: (string | SelectOption)[]
  iconSize?: number
  iconColor?: string
  containerClassName?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  labelClassName = 'block text-xs font-semibold text-[#48aad9] mb-1.5',
  options,
  iconSize = 18,
  iconColor = 'text-gray-300',
  containerClassName = 'relative',
  className = '',
  children,
  ...props
}) => {
  const defaultStyle =
    'w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] appearance-none transition-colors cursor-pointer text-sm pr-10'

  return (
    <div>
      {label && <label className={labelClassName}>{label}</label>}
      <div className={containerClassName}>
        <select className={`${defaultStyle} ${className}`} {...props}>
          {options
            ? options.map((opt) => {
                if (typeof opt === 'string') {
                  return (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  )
                }
                return (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    hidden={opt.hidden}
                    className={opt.className}
                  >
                    {opt.label}
                  </option>
                )
              })
            : children}
        </select>
        <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none ${iconColor}`}>
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Select
