import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { 
  LayoutDashboard, Activity, TrendingUp, FileText, Users,
  Calendar, Award, FileCheck, Settings, ChevronLeft, ChevronRight, Bell
} from 'lucide-react'

const roleMenus = {
  DTD: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Submit Activity', path: '/activities', icon: Activity },
    { label: 'Leaderboard', path: '/leaderboard', icon: TrendingUp },
    { label: 'Evaluations', path: '/evaluations', icon: FileText },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  DT: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Evaluate DTD', path: '/evaluate', icon: FileCheck },
    { label: 'Submit Activity', path: '/activities', icon: Activity },
    { label: 'Leaderboard', path: '/leaderboard', icon: TrendingUp },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  Admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Evaluate DT', path: '/evaluate', icon: FileCheck },
    { label: 'Monitor DTD', path: '/users', icon: Users },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  SuperAdmin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/users', icon: Users },
    { label: 'Promotions', path: '/promotions', icon: Award },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
}

export const Sidebar = ({ isMobile = false, onClose = () => {} }) => {
  const { user, userRole } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  
  const menu = roleMenus[userRole] || []
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  const handleLinkClick = () => {
    if (isMobile) {
      onClose()
    }
  }

  if (isMobile) {
    return (
      <div className="flex flex-col justify-between h-[calc(100%-3rem)] text-text-main">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Navigation */}
          <nav className="space-y-1.5">
            {menu.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-light text-brand font-semibold shadow-sm'
                      : 'text-text-muted hover:bg-surface-muted hover:text-text-main font-medium'
                  }`}
                >
                  <Icon size={18} className={`${isActive ? 'text-brand' : 'text-text-light group-hover:text-text-main'} transition-colors`} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile Footer Card */}
        <div className="pt-4 mt-2 border-t border-surface-border">
          <div className="flex items-center gap-3 bg-surface-muted p-2 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold uppercase flex-shrink-0 text-sm shadow-sm">
              {displayName.slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main truncate capitalize">{displayName}</p>
              <p className="text-xs text-text-muted truncate">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <aside className={`bg-surface rounded-2xl shadow-soft border border-surface-border text-text-main flex flex-col justify-between transition-all duration-300 z-40 sticky top-24 h-[calc(100vh-7rem)] ${
      collapsed ? 'w-20 p-3' : 'w-64 p-4'
    }`}>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Toggle Collapse Button & Role Badge */}
        <div className={`flex items-center justify-between pb-4 mb-4 border-b border-surface-border ${collapsed ? 'flex-col gap-3' : ''}`}>
          {!collapsed && (
            <div className="bg-brand-light text-brand px-3 py-1 rounded-full border border-brand/10">
              <p className="text-xs font-bold uppercase tracking-widest">{userRole}</p>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-main transition-colors duration-200"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-xl transition-all duration-200 group ${
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-brand-light text-brand font-semibold shadow-sm'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text-main font-medium'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={`${isActive ? 'text-brand' : 'text-text-light group-hover:text-text-main'} transition-colors`} />
                {!collapsed && <span className="text-sm tracking-tight">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Profile Footer Card */}
      <div className={`pt-4 mt-2 border-t border-surface-border ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 bg-surface-muted p-2 rounded-xl ${collapsed ? 'w-fit' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center font-bold uppercase flex-shrink-0 text-sm shadow-sm">
            {displayName.slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-text-main truncate capitalize">{displayName}</p>
              <p className="text-xs text-text-muted truncate">{userRole}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
