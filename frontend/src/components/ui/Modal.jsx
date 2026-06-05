import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md' // 'sm' | 'md' | 'lg' | 'xl'
}) => {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  const selectedSize = sizeClasses[size] || sizeClasses.md

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-primary-darkest/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className={`w-full ${selectedSize} bg-white rounded-2xl border border-gray-100 shadow-2xl z-10 overflow-hidden transform scale-100 transition-all duration-300 animate-[fadeInScale_0.2s_ease-out] my-4`}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-primary-darkest">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
export default Modal
