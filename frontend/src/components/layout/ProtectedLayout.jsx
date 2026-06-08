import React from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export const ProtectedLayout = ({ children }) => {
  const { loading, toasts, removeToast } = useAuth()

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
      <Navbar />
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
