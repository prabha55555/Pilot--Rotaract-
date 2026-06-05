import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { api } from '../../services/api'
import { 
  Award, ArrowUpRight, Plus, UserCheck, Calendar, 
  ChevronRight, BadgeInfo, Check, ShieldAlert
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/Button'

export default function PromotionsPage() {
  const { user: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState([])
  const [candidates, setCandidates] = useState([])
  const [toast, setToast] = useState(null)

  // Promotion form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newRole, setNewRole] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Promotions with joined user names
      const { data: promotionsData, error: promoError } = await supabase
        .from('promotions')
        .select('*')
        .order('promoted_at', { ascending: false })

      if (promoError) throw promoError

      // Fetch all users to map names manually (guarantees no ambiguity in multi-relation joins)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, pilot_id, club, role')

      if (usersError) throw usersError

      const userMap = {}
      usersData?.forEach(u => {
        userMap[u.id] = u
      })

      // Merge data
      const mergedPromotions = promotionsData.map(promo => ({
        ...promo,
        candidate: userMap[promo.user_id] || { name: 'Unknown User', pilot_id: 'N/A' },
        promoter: userMap[promo.promoted_by] || { name: 'System / Admin' }
      }))

      setPromotions(mergedPromotions)

      // Filter active candidates for manual promotion
      const activeCandidates = usersData.filter(u => u.role !== 'SuperAdmin' && u.id !== currentUser?.id)
      setCandidates(activeCandidates)

    } catch (err) {
      console.error(err)
      showToast('Error loading promotion records', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = () => {
    setSelectedUserId('')
    setNewRole('')
    setIsModalOpen(true)
  }

  const handlePromoteUser = async (e) => {
    e.preventDefault()
    if (!selectedUserId || !newRole) {
      showToast('Please select a user and assign a new role', 'error')
      return
    }

    setSubmitting(true)
    try {
      await api.promoteUser(selectedUserId, newRole)
      showToast('User promoted successfully!')
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to promote user', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Map user role for dropdown suggestion
  const getSuggestedRole = () => {
    const userToPromote = candidates.find(c => c.id === selectedUserId)
    if (!userToPromote) return ''
    if (userToPromote.role === 'DTD') return 'DT'
    if (userToPromote.role === 'DT') return 'Admin'
    if (userToPromote.role === 'Admin') return 'SuperAdmin'
    return ''
  }

  useEffect(() => {
    if (selectedUserId) {
      setNewRole(getSuggestedRole())
    }
  }, [selectedUserId])

  const columns = [
    {
      header: 'Trainer Promoted',
      accessor: 'candidate.name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.candidate?.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase block">{row.candidate?.pilot_id}</span>
        </div>
      )
    },
    {
      header: 'Old Role',
      accessor: 'old_role',
      render: (row) => <Badge variant={row.old_role}>{row.old_role}</Badge>
    },
    {
      header: 'New Role',
      accessor: 'new_role',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-semantic-success">
          <ArrowUpRight size={14} className="stroke-[2.5]" />
          <Badge variant={row.new_role}>{row.new_role}</Badge>
        </div>
      )
    },
    {
      header: 'Authorized By',
      accessor: 'promoter.name',
      render: (row) => <span className="text-xs font-semibold text-text-muted">{row.promoter?.name}</span>
    },
    {
      header: 'Date Promoted',
      accessor: 'promoted_at',
      sortable: true,
      render: (row) => <span className="text-xs text-text-light font-medium">{new Date(row.promoted_at).toLocaleDateString()}</span>
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions Registry"
        subtitle="Review historical role upgrades, check qualifications, and manually upgrade trainer roles."
        actionText="Initiate Promotion"
        onActionClick={handleOpenModal}
        actionIcon={Plus}
      />

      <DataTable
        columns={columns}
        data={promotions}
        searchPlaceholder="Search promotion history..."
        searchKey="candidate.name"
        emptyTitle="No Promotions Recorded"
        emptyDescription="There are no promotion entries registered in the database history."
      />

      {/* Manual Promotion Trigger Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Role Promotion"
        size="sm"
      >
        <form className="space-y-5 mt-2" onSubmit={handlePromoteUser}>
          <div className="bg-semantic-warning/10 border border-semantic-warning/20 p-4 rounded-xl flex items-start gap-2.5">
            <ShieldAlert className="text-semantic-warning flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-xs font-bold text-yellow-800">Authorization Required</p>
              <p className="text-[10px] text-yellow-700 mt-0.5 leading-relaxed font-semibold">
                Promotions immediately update user credentials and sidebar access permissions in real-time.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Select Trainer <span className="text-semantic-error">*</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer"
              required
            >
              <option value="">Select trainer to upgrade...</option>
              {candidates.map(cand => (
                <option key={cand.id} value={cand.id}>
                  {cand.name} ({cand.role} - {cand.pilot_id})
                </option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <div>
              <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
                Target Upgrade Role <span className="text-semantic-error">*</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer"
                required
              >
                <option value="">Select role...</option>
                <option value="DT">District Trainer (DT)</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
            </div>
          )}

          <div className="pt-3">
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              isLoading={submitting}
              icon={<UserCheck size={16} />}
            >
              {submitting ? 'Upgrading Role...' : 'Authorize Role Promotion'}
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
