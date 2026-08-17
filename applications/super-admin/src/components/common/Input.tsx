import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelClassName?: string
  error?: string
  containerClassName?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  labelClassName = 'block text-xs font-semibold text-[#48aad9] mb-1.5',
  error,
  containerClassName = '',
  className = '',
  ...props
}) => {
  const defaultStyle =
    'w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors text-sm'

  return (
    <div className={containerClassName}>
      {label && <label className={labelClassName}>{label}</label>}
      <input className={`${defaultStyle} ${className}`} {...props} />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default Input
