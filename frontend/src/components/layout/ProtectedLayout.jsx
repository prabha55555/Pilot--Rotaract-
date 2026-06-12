import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { X } from 'lucide-react'
import logo from '../../utils/logo.png'

export const ProtectedLayout = ({ children }) => {
  const { loading, toasts, removeToast } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-muted">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-text-main font-semibold text-lg font-outfit">Loading PILOT...</p>
        <p className="text-text-muted text-sm mt-1">Please wait while we prepare your workspace</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <Navbar onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1 overflow-hidden pt-4 pb-4 px-4 sm:px-6 lg:px-8 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Sidebar container */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>
        {/* Main Content container */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full pb-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface shadow-xl focus:outline-none transition-transform duration-300 ease-out transform translate-x-0">
            {/* Close button inside drawer */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-surface-muted hover:bg-text-light/10 text-text-muted hover:text-text-main rounded-xl transition"
                aria-label="Close menu"
              >
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>
            
            {/* Sidebar content */}
            <div className="h-full pt-5 pb-4 px-4 overflow-y-auto">
              <div className="flex items-center gap-3 px-2 mb-6 pb-4 border-b border-surface-border">
                <img src={logo} alt="PILOT Logo" className="h-9 w-auto" />
                <span className="font-bold text-text-main font-outfit text-base">PILOT Control</span>
              </div>
              <Sidebar isMobile={true} onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Realtime Toast Stack Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-zinc-900/95 backdrop-blur text-white rounded-xl shadow-floating border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-all"
          >
            <div className="flex-1">
              <p className="text-xs font-mono font-semibold tracking-wider text-blue-400 uppercase">{t.title}</p>
              <p className="text-sm font-semibold mt-1 leading-tight">{t.message}</p>
              <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Click to dismiss</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
