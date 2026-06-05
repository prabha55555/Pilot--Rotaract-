import React from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export const ProtectedLayout = ({ children }) => {
  const { loading } = useAuth()

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
    </div>
  )
}
