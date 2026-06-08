import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Notification states
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const userEmail = session.user.email

          // 1. Fetch user role and name from users table by email (to support Google Sign-in)
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('id, role, name')
            .eq('email', userEmail)
            .single()
          
          if (fetchError || !userData) {
            console.error('❌ User email is not pre-registered in users table:', userEmail)
            await supabase.auth.signOut()
            setError('Access denied. Your email is not registered in the system. Please contact the Super Admin.')
            setUser(null)
            setUserRole(null)
            setLoading(false)
            return
          }

          // 2. Link Auth user ID with users table ID if they do not match
          if (userData.id !== session.user.id) {
            console.log('🔄 Syncing user database record ID with Auth ID...')
            const { error: updateIdError } = await supabase
              .from('users')
              .update({ id: session.user.id })
              .eq('email', userEmail)

            if (updateIdError) {
              console.error('Failed to link database profile:', updateIdError.message)
            }
          }

          console.log('✅ Role and Name fetched:', userData.role, userData.name)
          setUserRole(userData.role || null)
          setUser({ ...session.user, name: userData.name || '' })
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('❌ Auth session error:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userEmail = session.user.email
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('id, role, name')
            .eq('email', userEmail)
            .single()

          if (fetchError || !userData) {
            console.error('❌ User email is not pre-registered in users table (auth change):', userEmail)
            await supabase.auth.signOut()
            setError('Access denied. Your email is not registered in the system. Please contact the Super Admin.')
            setUser(null)
            setUserRole(null)
            return
          }

          // Link ID if mismatched
          if (userData.id !== session.user.id) {
            await supabase
              .from('users')
              .update({ id: session.user.id })
              .eq('email', userEmail)
          }

          console.log('✅ Role and Name fetched (auth change):', userData.role, userData.name)
          setUserRole(userData.role || null)
          setUser({ ...session.user, name: userData.name || '' })
          setError(null)
        } else {
          setUser(null)
          setUserRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Notification actions
  const fetchNotifications = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (error) throw error
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (err) {
      console.error('Error fetching notifications:', err.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()

      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new
            setNotifications(prev => [newNotif, ...prev])
            setUnreadCount(c => c + 1)
            
            // Add alert to toast stack
            const toastId = Date.now()
            setToasts(prev => [...prev, { id: toastId, ...newNotif }])
            
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== toastId))
            }, 6000)
          } else {
            fetchNotifications()
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  const markAsRead = async (notifId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId)
      if (error) throw error
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
      if (error) throw error
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  const clearNotification = async (notifId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notifId)
      if (error) throw error
      setNotifications(prev => prev.filter(n => n.id !== notifId))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId))
  }

  const login = async (email, password) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const loginWithGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })
    if (error) throw error
  }

  const signup = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      error,
      setError,
      login,
      loginWithGoogle,
      signup,
      logout,
      resetPassword,
      updatePassword,
      isAuthenticated: !!user,
      notifications,
      unreadCount,
      toasts,
      markAsRead,
      markAllAsRead,
      clearNotification,
      removeToast,
      fetchNotifications
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
