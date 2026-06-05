import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react'

export const Toast = ({ 
  message, 
  type = 'success', // 'success' | 'error' | 'info' | 'warning'
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle2 className="text-success stroke-[2.5]" size={20} />,
    error: <AlertCircle className="text-error stroke-[2.5]" size={20} />,
    info: <Info className="text-blue-500 stroke-[2.5]" size={20} />,
    warning: <AlertCircle className="text-warning stroke-[2.5]" size={20} />
  }

  const borderColors = {
    success: 'border-green-100 bg-green-50/70',
    error: 'border-red-100 bg-red-50/70',
    info: 'border-blue-100 bg-blue-50/70',
    warning: 'border-amber-100 bg-amber-50/70'
  }

  return (
    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4.5 py-3 border rounded-xl shadow-xl backdrop-blur-md animate-[slideInRight_0.2s_ease-out] max-w-sm ${borderColors[type] || borderColors.info}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-bold text-gray-800 leading-snug">
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
export default Toast
