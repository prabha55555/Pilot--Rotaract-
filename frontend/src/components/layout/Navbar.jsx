import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { LogOut, ChevronDown, Bell, User, Settings } from 'lucide-react'
import logo from '../../utils/logo.png'

export const Navbar = () => {
  const { 
    user, 
    userRole, 
    logout, 
    isAuthenticated,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-surface-border text-text-main sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center h-16">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 active:scale-95 transition">
          <img src={logo} alt="PILOT Logo" className="h-8 w-auto" />
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen)
                  setDropdownOpen(false)
                }}
                className="relative p-2 rounded-xl text-text-muted hover:bg-surface-muted hover:text-text-main active:scale-95 transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-semantic-error">
                  </span>
                )}
              </button>

              {/* Notification Menu */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-floating border border-surface-border z-50 overflow-hidden origin-top-right">
                  <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface-muted/50">
                    <span className="font-semibold text-text-main font-outfit">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-brand font-medium hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-surface-border">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 hover:bg-surface-muted transition-colors cursor-pointer ${!notif.is_read ? 'bg-brand-light/30' : ''}`}
                          onClick={() => {
                            if (!notif.is_read) markAsRead(notif.id)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {!notif.is_read && <div className="mt-1.5 h-2 w-2 rounded-full bg-brand flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!notif.is_read ? 'text-text-main font-semibold' : 'text-text-muted'}`}>{notif.title}</p>
                              <p className="text-xs text-text-muted mt-0.5 break-words">{notif.message}</p>
                              <span className="text-[10px] text-text-light font-medium block mt-1">
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-text-light text-sm">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-surface-border text-center bg-surface-muted/30">
                    <button 
                      onClick={() => {
                        setNotifOpen(false)
                        navigate('/notifications')
                      }}
                      className="text-xs text-brand font-semibold hover:underline w-full"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-surface-border hidden sm:block"></div>

            {/* User Info with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setDropdownOpen(!dropdownOpen)
                  setNotifOpen(false)
                }}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-xl hover:bg-surface-muted active:scale-95 transition"
              >
                <div className="text-right hidden sm:block mr-1">
                  <p className="text-sm font-semibold text-text-main capitalize leading-tight">{user?.name || user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-text-muted font-medium">{userRole}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-xs uppercase">
                  {(user?.name || user?.email?.split('@')[0])?.slice(0,2)}
                </div>
                <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-floating border border-surface-border z-50 overflow-hidden origin-top-right">
                  <div className="p-3 border-b border-surface-border text-center sm:hidden bg-surface-muted/50">
                    <p className="text-sm font-semibold text-text-main capitalize">{user?.name || user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-text-muted font-medium">{userRole}</p>
                  </div>
                  
                  <div className="p-1">
                    <Link 
                      to="/profile" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-main hover:bg-surface-muted rounded-lg transition-colors"
                    >
                      <User size={16} className="text-text-muted" />
                      Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-main hover:bg-surface-muted rounded-lg transition-colors"
                    >
                      <Settings size={16} className="text-text-muted" />
                      Settings
                    </Link>
                  </div>
                  
                  <div className="p-1 border-t border-surface-border">
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-semantic-error font-medium hover:bg-semantic-errorLight rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </nav>
  )
}
export default Navbar

