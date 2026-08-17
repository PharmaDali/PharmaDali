import React, { useEffect } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
  maxWidth?: string
  zIndex?: string
  animate?: boolean
  className?: string
  overlayClassName?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-[500px]',
  zIndex = 'z-50',
  animate = true,
  className = '',
  overlayClassName = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/65 p-4 ${
        animate ? 'animate-fade-in' : ''
      } ${overlayClassName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose()
        }
      }}
    >
      <div
        className={`bg-[#292d37] w-full ${maxWidth} rounded-[20px] p-8 shadow-2xl border border-[rgba(255,255,255,0.05)] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
