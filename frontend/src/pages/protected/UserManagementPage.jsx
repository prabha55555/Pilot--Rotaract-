import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { 
  Plus, Edit2, ShieldAlert, Archive, Trash, Check, UserMinus,
  Filter, Search, X, ShieldCheck, ArrowUp, RotateCcw
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export default function UserManagementPage() {
  const { user: currentUser, userRole } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // Form State
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [club, setClub] = useState('')
  const [role, setRole] = useState('')
  const [batch, setBatch] = useState('')
  const [phone, setPhone] = useState('')
  const [pilotId, setPilotId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Filters State
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await api.listUsers()
      setUsers(data || [])
    } catch (err) {
      console.error(err)
      showToast('Failed to load users list', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingUser(null)
    setEmail('')
    setName('')
    setPassword('')
    setClub('')
    setRole('DTD')
    setBatch(new Date().getFullYear().toString())
    setPhone('')
    setPilotId('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (user) => {
    setEditingUser(user)
    setEmail(user.email)
    setName(user.name)
    setClub(user.club || '')
    setRole(user.role)
    setBatch(user.batch || '')
    setPhone(user.phone || '')
    setPilotId(user.pilot_id || '')
    setIsModalOpen(true)
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return
    try {
      await api.deactivateUser(id)
      showToast('User deactivated successfully')
      fetchUsers()
    } catch (err) {
      console.error(err)
      showToast('Failed to deactivate user', 'error')
    }
  }

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this user record?')) return
    try {
      await api.archiveUser(id)
      showToast('User archived successfully')
      fetchUsers()
    } catch (err) {
      console.error(err)
      showToast('Failed to archive user', 'error')
    }
  }

  const handlePromote = async (user) => {
    const nextRoleMap = {
      DTD: 'DT',
      DT: 'Admin',
      Admin: 'SuperAdmin'
    }

    if (userRole === 'Admin' && user.role !== 'DTD') {
      showToast('Admins are only allowed to promote DTD to DT.', 'error')
      return
    }

    const nextRole = nextRoleMap[user.role]
    if (!nextRole) {
      showToast('This user is already at the maximum role', 'warning')
      return
    }

    if (!window.confirm(`Are you sure you want to promote ${user.name} from ${user.role} to ${nextRole}?`)) return
    
    try {
      await api.promoteUser(user.id, nextRole)
      showToast(`Successfully promoted ${user.name} to ${nextRole}!`)
      fetchUsers()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Promotion failed', 'error')
    }
  }

  const handleRevert = async (user) => {
    if (!window.confirm(`Are you sure you want to revert ${user.name}'s role? This will restore their previous role based on their latest promotion history.`)) return
    
    try {
      await api.revertUser(user.id)
      showToast(`Successfully reverted ${user.name}'s role!`)
      fetchUsers()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Reversion failed', 'error')
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!email || !name || !role || (!editingUser && !password)) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    const normalizedPilotId = pilotId.trim().toUpperCase()
    if (!normalizedPilotId) {
      showToast('Pilot ID is required', 'error')
      return
    }

    // Uniqueness validation client-side
    const isDuplicate = users.some(u => 
      u.pilot_id?.trim().toUpperCase() === normalizedPilotId && 
      (!editingUser || u.id !== editingUser.id)
    )
    if (isDuplicate) {
      showToast('Pilot ID must be unique across the system', 'error')
      return
    }

    setSubmitting(true)
    try {
      const userData = { 
        email, 
        name, 
        club, 
        role, 
        batch, 
        phone,
        pilot_id: normalizedPilotId,
        ...(editingUser ? {} : { password })
      }
      
      if (editingUser) {
        await api.updateUser(editingUser.id, userData)
        showToast('User updated successfully')
      } else {
        await api.createUser(userData)
        showToast('User registered successfully')
      }
      
      setIsModalOpen(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to save user details', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter logic
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter ? u.role === roleFilter : true
    const matchesStatus = statusFilter ? u.status === statusFilter : true
    return matchesRole && matchesStatus
  })

  // Columns definition for DataTable
  const columns = [
    { 
      header: 'Name / ID', 
      accessor: 'name', 
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mt-0.5">{row.pilot_id}</span>
        </div>
      )
    },
    { 
      header: 'Email / Phone', 
      accessor: 'email', 
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-text-main text-xs block">{row.email}</span>
          <span className="text-[10px] text-text-muted block mt-0.5">{row.phone || 'No phone'}</span>
        </div>
      )
    },
    { 
      header: 'Club', 
      accessor: 'club', 
      sortable: true,
      render: (row) => <span className="text-xs font-medium text-text-main">{row.club || '-'}</span>
    },
    { 
      header: 'Batch', 
      accessor: 'batch', 
      sortable: true,
      render: (row) => <span className="text-xs font-medium text-text-muted">{row.batch || '-'}</span>
    },
    { 
      header: 'Role', 
      accessor: 'role', 
      sortable: true,
      render: (row) => <Badge variant={row.role}>{row.role}</Badge>
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      sortable: true,
      render: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        // Can't manage self
        if (row.email === currentUser?.email) {
          return <span className="text-xs text-text-muted font-medium italic px-2">You (Current)</span>
        }
        
        const isSuperAdmin = userRole === 'SuperAdmin'
        const isAdmin = userRole === 'Admin'
        
        // Admins can only modify/deactivate DTD and DT
        const canModify = isSuperAdmin || (isAdmin && (row.role === 'DTD' || row.role === 'DT'))
        const canPromote = (isSuperAdmin && row.role !== 'SuperAdmin') || (isAdmin && row.role === 'DTD')
        const canRevert = isSuperAdmin && row.role !== 'DTD' && (row.status === 'Promoted' || row.status === 'Active')

        return (
          <div className="flex items-center gap-1.5">
            {canModify && (
              <button
                onClick={() => handleOpenEditModal(row)}
                title="Edit User"
                className="p-2 bg-brand-light text-brand hover:bg-brand hover:text-white rounded-lg transition-all"
              >
                <Edit2 size={13} className="stroke-[2.5]" />
              </button>
            )}
            {canPromote && row.status === 'Active' && (
              <button
                onClick={() => handlePromote(row)}
                title="Promote Role"
                className="p-2 bg-green-50 text-success hover:bg-success hover:text-white rounded-lg transition-all"
              >
                <ArrowUp size={13} className="stroke-[2.5]" />
              </button>
            )}
            {canRevert && (
              <button
                onClick={() => handleRevert(row)}
                title="Revert Role / Rollback"
                className="p-2 bg-rose-50 text-semantic-error hover:bg-semantic-error hover:text-white rounded-lg transition-all"
              >
                <RotateCcw size={13} className="stroke-[2.5]" />
              </button>
            )}
            {canModify && row.status === 'Active' && (
              <button
                onClick={() => handleDeactivate(row.id)}
                title="Deactivate Account"
                className="p-2 bg-amber-50 text-warning hover:bg-warning hover:text-white rounded-lg transition-all"
              >
                <UserMinus size={13} className="stroke-[2.5]" />
              </button>
            )}
            {canModify && row.status !== 'Archived' && (
              <button
                onClick={() => handleArchive(row.id)}
                title="Archive Record"
                className="p-2 bg-surface-muted text-text-muted hover:bg-text-light hover:text-white rounded-lg transition-all"
              >
                <Archive size={13} className="stroke-[2.5]" />
              </button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management Directory"
        subtitle="Search and configure user accounts, coordinate roles, and administer promotions."
        actionText="Register User"
        onActionClick={handleOpenCreateModal}
        actionIcon={Plus}
      />

      {/* Filter Options */}
      <Card className="p-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-main font-outfit">
          <Filter size={18} className="text-text-muted" />
          Filter Directory
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="Admin">Admin</option>
            <option value="DT">District Trainer (DT)</option>
            <option value="DTD">Deputy Trainer (DTD)</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Promoted">Promoted</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
          {(roleFilter || statusFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setRoleFilter(''); setStatusFilter(''); }}
              icon={<X size={14} />}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Directory Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          searchPlaceholder="Search directory by name, email, or club..."
          searchKey="name"
          emptyTitle="No Directory Listings Found"
          emptyDescription="We couldn't find any users matching the filters selected."
        />
      )}

      {/* Register/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Update User Information' : 'Register New User'}
        size="md"
      >
        <form className="space-y-5 mt-2" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Full Name <span className="text-semantic-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Email Address <span className="text-semantic-error">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!editingUser}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="e.g. john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Pilot ID <span className="text-semantic-error">*</span>
            </label>
            <input
              type="text"
              value={pilotId}
              onChange={(e) => setPilotId(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
              placeholder="e.g. PILOT001"
              required
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
                Password <span className="text-semantic-error">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
                placeholder="Enter password (min 6 characters)"
                required={!editingUser}
                minLength={6}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
                Mobile / Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
                placeholder="e.g. +91 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
                Rotaract Club
              </label>
              <input
                type="text"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
                placeholder="e.g. Rotaract Club of Chennai"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
                Role Assignment <span className="text-semantic-error">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer"
                required
              >
                <option value="DTD">Deputy Trainer (DTD)</option>
                <option value="DT">District Trainer (DT)</option>
                {userRole === 'SuperAdmin' && (
                  <>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
                Year / Batch
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
                placeholder="e.g. 2026"
              />
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              isLoading={submitting}
            >
              {submitting ? 'Processing...' : editingUser ? 'Update User Details' : 'Register User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Floating Toast Notification */}
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
