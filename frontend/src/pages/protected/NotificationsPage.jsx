import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { 
  Bell, Check, Trash, Trash2, CheckSquare, 
  Filter, X, ShieldAlert, Inbox
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatIST } from '../../utils/date'

export default function NotificationsPage() {
  const { user, fetchNotifications: syncNavbarNotifications } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Filters State
  const [statusFilter, setStatusFilter] = useState('All') // All | Read | Unread
  const [typeFilter, setTypeFilter] = useState('') // All types

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadNotifications = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error(err)
      showToast('Failed to load notifications history', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  const handleMarkAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      showToast('Notification marked as read')
      syncNavbarNotifications()
    } catch (err) {
      console.error(err)
      showToast('Failed to mark notification as read', 'error')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user || notifications.length === 0) return
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      showToast('All notifications marked as read')
      syncNavbarNotifications()
    } catch (err) {
      console.error(err)
      showToast('Failed to mark all as read', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== id))
      showToast('Notification deleted')
      syncNavbarNotifications()
    } catch (err) {
      console.error(err)
      showToast('Failed to delete notification', 'error')
    }
  }

  const handleClearAll = async () => {
    if (!user || notifications.length === 0) return
    if (!window.confirm('Are you sure you want to clear your entire notification history? This cannot be undone.')) return
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications([])
      showToast('Notification history cleared')
      syncNavbarNotifications()
    } catch (err) {
      console.error(err)
      showToast('Failed to clear notification history', 'error')
    }
  }

  // Filter & Search Logic
  const filteredNotifications = notifications.filter(n => {
    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Read' ? n.is_read === true :
      n.is_read === false

    const matchesType = typeFilter ? n.type === typeFilter : true
    return matchesStatus && matchesType
  })

  // Columns definition for DataTable
  const columns = [
    { 
      header: 'Subject & Message', 
      accessor: 'title', 
      sortable: true,
      render: (row) => (
        <div className="max-w-md md:max-w-xl">
          <span className={`font-semibold block ${!row.is_read ? 'text-[#002060] font-bold' : 'text-text-muted font-medium'}`}>
            {row.title}
          </span>
          <span className="text-xs text-text-muted block mt-1 leading-relaxed">{row.message}</span>
        </div>
      )
    },
    { 
      header: 'Received At', 
      accessor: 'created_at', 
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-text-muted">
          {formatIST(row.created_at)}
        </span>
      )
    },
    { 
      header: 'Type', 
      accessor: 'type', 
      sortable: true,
      render: (row) => {
        let badgeType = 'info'
        if (row.type === 'promotion' || row.type === 'promote') badgeType = 'success'
        if (row.type === 'reject') badgeType = 'danger'
        return <Badge variant={badgeType}>{row.type}</Badge>
      }
    },
    { 
      header: 'Status', 
      accessor: 'is_read', 
      sortable: true,
      render: (row) => (
        <Badge variant={row.is_read ? 'secondary' : 'warning'}>
          {row.is_read ? 'Read' : 'Unread'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {!row.is_read && (
            <button
              onClick={() => handleMarkAsRead(row.id)}
              title="Mark as Read"
              className="p-2 bg-green-50 text-success hover:bg-success hover:text-white rounded-lg transition-all"
            >
              <Check size={13} className="stroke-[2.5]" />
            </button>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            title="Delete"
            className="p-2 bg-rose-50 text-semantic-error hover:bg-semantic-error hover:text-white rounded-lg transition-all"
          >
            <Trash size={13} className="stroke-[2.5]" />
          </button>
        </div>
      )
    }
  ]

  // Distinct notification types for filter select
  const notificationTypes = Array.from(new Set(notifications.map(n => n.type)))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subtitle="Review log updates, submissions feedback, user registrations, and promotion notices."
      />

      {/* Control Actions & Filter Bar */}
      <Card className="p-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-main font-outfit mr-2">
            <Filter size={18} className="text-text-muted" />
            Filter
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Unread">Unread Only</option>
            <option value="Read">Read Only</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
          >
            <option value="">All Types</option>
            {notificationTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {(statusFilter !== 'All' || typeFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setStatusFilter('All'); setTypeFilter(''); }}
              icon={<X size={14} />}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {notifications.some(n => !n.is_read) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllAsRead}
              icon={<CheckSquare size={14} />}
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAll}
              icon={<Trash2 size={14} />}
            >
              Clear history
            </Button>
          )}
        </div>
      </Card>

      {/* Notifications DataTable */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredNotifications}
          searchPlaceholder="Search notifications by title or contents..."
          searchKey="title"
          pageSize={10}
          emptyTitle="Inbox is clean!"
          emptyDescription="You have no notifications matching the selected filters."
        />
      )}

      {/* Toast Messages */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
