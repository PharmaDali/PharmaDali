import React from 'react'
import Modal, { type ModalProps } from './Modal'

export type ConfirmIconType = 'question' | 'success' | 'danger' | 'success-question' | 'custom'

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  icon?: ConfirmIconType | React.ReactNode
  iconColor?: string
  title: string
  titleColor?: string
  description?: string | React.ReactNode
  extraContent?: React.ReactNode
  cancelLabel?: string
  confirmLabel?: string
  onCancel?: () => void
  onConfirm?: () => void
  confirmButtonVariant?: 'blue' | 'green' | 'danger' | 'success'
  singleButton?: boolean
  containerBgClass?: string
  paddingClass?: string
  buttonTextSize?: string
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  icon = 'question',
  iconColor,
  title,
  titleColor = 'text-white',
  description,
  extraContent,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
  confirmButtonVariant = 'blue',
  singleButton = false,
  maxWidth = 'max-w-[440px]',
  zIndex = 'z-[60]',
  animate = true,
  className = '',
  containerBgClass = '',
  paddingClass = 'p-8',
  buttonTextSize = 'text-sm',
}) => {
  const handleCancel = () => {
    if (onCancel) onCancel()
    else if (onClose) onClose()
  }

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon
    }

    if (icon === 'question') {
      return (
        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mx-auto mb-5 text-white">
          <span className="text-3xl font-light leading-none">?</span>
        </div>
      )
    }

    if (icon === 'success-question') {
      return (
        <div className="w-16 h-16 rounded-full border-2 border-[#4ade80] flex items-center justify-center mx-auto mb-4 text-[#4ade80]">
          <span className="text-3xl font-bold leading-none">?</span>
        </div>
      )
    }

    if (icon === 'success') {
      return (
        <div className="w-16 h-16 rounded-full bg-[#00c853]/20 border-2 border-[#00c853] flex items-center justify-center mx-auto mb-5 text-[#00c853]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )
    }

    if (icon === 'danger') {
      const color = iconColor || '#ff4d4d'
      return (
        <div
          className="w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-4 font-bold"
          style={{ borderColor: color, color }}
        >
          <span className="text-3xl leading-none">!</span>
        </div>
      )
    }

    return null
  }

  const getConfirmButtonClasses = () => {
    switch (confirmButtonVariant) {
      case 'green':
      case 'success':
        return 'bg-[#00c853] hover:bg-[#00b048] text-white'
      case 'danger':
        return 'bg-[#ff4d4d] hover:bg-[#e03e3e] text-white'
      case 'blue':
      default:
        return 'bg-[#38bdf8] hover:bg-[#2aa6e0] text-white'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose || handleCancel}
      maxWidth={maxWidth}
      zIndex={zIndex}
      animate={animate}
      className={`text-center ${containerBgClass} ${paddingClass} ${className}`}
    >
      {renderIcon()}

      <h2 className={`text-2xl font-bold mb-3 ${titleColor}`}>{title}</h2>

      {description && (
        <div className="text-gray-300 text-sm mb-7 leading-relaxed">
          {description}
        </div>
      )}

      {extraContent}

      {singleButton ? (
        <div>
          <button
            type="button"
            onClick={onConfirm || handleCancel}
            className={`w-full py-3 px-4 rounded-[10px] ${getConfirmButtonClasses()} font-semibold transition-colors ${buttonTextSize} cursor-pointer`}
          >
            {confirmLabel}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className={`w-full py-3 px-4 rounded-[10px] border border-gray-500/60 text-gray-200 hover:bg-white/5 font-semibold transition-colors ${buttonTextSize} cursor-pointer`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-3 px-4 rounded-[10px] ${getConfirmButtonClasses()} font-semibold shadow transition-colors ${buttonTextSize} cursor-pointer`}
          >
            {confirmLabel}
          </button>
        </div>
      )}
    </Modal>
  )
}

export default ConfirmModal
