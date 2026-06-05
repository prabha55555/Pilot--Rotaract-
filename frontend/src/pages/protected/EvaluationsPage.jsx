import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { api } from '../../services/api'
import { 
  FileText, CheckCircle, Award, AlertCircle, Plus, 
  MessageSquare, Sparkles, Send, Filter, Check, Eye
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ActivityDetailsModal } from '../../components/ui/ActivityDetailsModal'

export default function EvaluationsPage() {
  const { user, userRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isEvaluatorView = location.pathname === '/evaluate'

  const [loading, setLoading] = useState(true)
  const [pendingActivities, setPendingActivities] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [toast, setToast] = useState(null)
  
  // Modal State
  const [selectedEval, setSelectedEval] = useState(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  // Form State
  const [selectedActivityId, setSelectedActivityId] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [remarks, setRemarks] = useState('')
  const [actionType, setActionType] = useState('Approved') // 'Approved' or 'Rejected'
  const [submitting, setSubmitting] = useState(false)

  // Activity Details Modal State
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const handleViewActivityDetails = async (activityId) => {
    if (!activityId) return
    setDetailsLoading(true)
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single()
      
      if (error) throw error
      setSelectedActivity(data)
      setIsDetailsOpen(true)
    } catch (err) {
      console.error('Error fetching activity details:', err)
      showToast('Could not load activity details', 'error')
    } finally {
      setDetailsLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Load data based on path and role
  const loadData = async () => {
    setLoading(true)
    try {
      if (isEvaluatorView) {
        // Find submitted activities based on evaluator role
        // For simplicity, any Admin/DT can see submitted activities from users they supervise,
        // or just all submitted activities in the system for this demo.
        const { data: actsData, error: actsError } = await supabase
          .from('activities')
          .select('*, user:users(id, name, club, pilot_id, role)')
          .in('status', ['Submitted', 'Pending Review', 'Resubmitted'])
          .order('created_at', { ascending: true })
        
        if (actsError) throw actsError
        // Filter out SuperAdmins/Admins if we only want to show DT/DTD
        setPendingActivities(actsData || [])

        // Fetch evaluations submitted by this evaluator
        const { data: evalsData, error: evalsError } = await supabase
          .from('evaluations')
          .select('*, candidate:users!candidate_id(name, pilot_id, club), activity:activities(title, status)')
          .eq('evaluator_id', user.id)
          .order('created_at', { ascending: false })
        
        if (evalsError) throw evalsError
        setEvaluations(evalsData || [])
      } else {
        // Candidate view (DTD or DT viewing own evaluations received)
        const { data: evalsData, error: evalsError } = await supabase
          .from('evaluations')
          .select('*, evaluator:users!evaluator_id(name, role), activity:activities(title, status)')
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false })
        
        if (evalsError) throw evalsError
        setEvaluations(evalsData || [])
      }
    } catch (err) {
      console.error(err)
      showToast('Error loading evaluation records', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Subscribe to realtime database changes for synchronization
    const activitiesChannel = supabase
      .channel('evaluations-activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          loadData()
        }
      )
      .subscribe()

    const evaluationsChannel = supabase
      .channel('evaluations-evaluations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'evaluations' },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(activitiesChannel)
      supabase.removeChannel(evaluationsChannel)
    }
  }, [isEvaluatorView, userRole, user])

  const handleOpenSubmitModal = (activity = null) => {
    if (activity) {
      setSelectedActivityId(activity.id)
      setSelectedCandidateId(activity.user_id)
    } else {
      setSelectedActivityId('')
      setSelectedCandidateId('')
    }
    setRemarks('')
    setActionType('Approved')
    setIsSubmitModalOpen(true)
  }

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault()
    if (!selectedActivityId || !remarks) {
      showToast('Please select an activity and enter remarks', 'error')
      return
    }

    setSubmitting(true)
    try {
      const evaluationData = {
        candidateId: selectedCandidateId,
        evaluatorId: user.id,
        remarks,
        activity_id: selectedActivityId,
        status: actionType, // Add status explicitly if our API allowed it, otherwise insert directly via Supabase below
        strengths: '',
        improvements: '',
        recommendation: actionType === 'Approved'
      }

      // 1. Insert into evaluations table
      const { error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          candidate_id: selectedCandidateId,
          evaluator_id: user.id,
          activity_id: selectedActivityId,
          remarks: remarks,
          status: actionType,
          recommendation: actionType === 'Approved'
        }])
      if (evalError) throw evalError

      // 2. Update activity status
      await api.updateActivityStatus(selectedActivityId, actionType)

      showToast(`Activity ${actionType} successfully!`)
      
      setIsSubmitModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to submit approval', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Evaluator Table Columns
  const evaluatorColumns = [
    { 
      header: 'Candidate Name', 
      accessor: 'candidate_name', 
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.candidate?.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase block">{row.candidate?.pilot_id}</span>
        </div>
      )
    },
    { 
      header: 'Activity Title', 
      accessor: 'activity', 
      render: (row) => <span className="font-semibold text-text-main text-sm block">{row.activity?.title || '-'}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row) => (
        <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'error' : 'warning'}>
          {row.status || (row.recommendation ? 'Promote' : 'Needs Work')}
        </Badge>
      )
    },
    { 
      header: 'Date Submitted', 
      accessor: 'created_at', 
      render: (row) => <span className="text-xs text-text-muted font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewActivityDetails(row.activity_id)}
            title="View Activity Details"
            className="p-2 bg-gray-50 text-text-muted hover:bg-gray-200 hover:text-text-main rounded-lg transition-all"
          >
            <Eye size={14} className="stroke-[2.5]" />
          </button>
          <button
            onClick={() => setSelectedEval(row)}
            title="View Evaluation Remarks"
            className="p-2 bg-brand-light text-brand hover:bg-brand hover:text-white rounded-lg transition-all"
          >
            <MessageSquare size={14} className="stroke-[2.5]" />
          </button>
        </div>
      )
    }
  ]

  // Candidate Table Columns (Evaluations Received)
  const candidateColumns = [
    { 
      header: 'Evaluator', 
      accessor: 'evaluator', 
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.evaluator?.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase block">{row.evaluator?.role}</span>
        </div>
      )
    },
    { 
      header: 'Activity Title', 
      accessor: 'activity', 
      render: (row) => <span className="font-semibold text-text-main text-sm block">{row.activity?.title || '-'}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row) => (
        <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Rejected' ? 'error' : 'warning'}>
          {row.status || 'Reviewed'}
        </Badge>
      )
    },
    { 
      header: 'Date Evaluated', 
      accessor: 'created_at', 
      render: (row) => <span className="text-xs text-text-muted font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewActivityDetails(row.activity_id)}
            title="View Activity Details"
            className="p-2 bg-gray-50 text-text-muted hover:bg-gray-200 hover:text-text-main rounded-lg transition-all"
          >
            <Eye size={14} className="stroke-[2.5]" />
          </button>
          <button
            onClick={() => setSelectedEval(row)}
            title="View Evaluation Remarks"
            className="p-2 bg-brand-light text-brand hover:bg-brand hover:text-white rounded-lg transition-all"
          >
            <MessageSquare size={14} className="stroke-[2.5]" />
          </button>
        </div>
      )
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
        title={isEvaluatorView ? 'Evaluator Dashboard' : 'Performance Feedback'}
        subtitle={isEvaluatorView 
          ? 'Conduct structured reviews, check candidate capabilities and submit performance evaluations.'
          : 'Read detailed assessment and validation remarks from District Trainers.'
        }
        actionText={isEvaluatorView ? 'Evaluate Candidate' : null}
        onActionClick={isEvaluatorView ? () => handleOpenSubmitModal() : null}
        actionIcon={isEvaluatorView ? Plus : null}
      />

      {isEvaluatorView ? (
        // Evaluator Listing
        <div className="space-y-6">
          {/* Quick activities bar */}
          {pendingActivities.length > 0 && (
            <Card className="p-5">
              <h4 className="text-sm font-semibold text-text-main font-outfit mb-3">Activities Pending Approval</h4>
              <div className="flex flex-wrap gap-2">
                {pendingActivities.map(act => (
                  <button
                    key={act.id}
                    onClick={() => handleOpenSubmitModal(act)}
                    className="px-3 py-2 bg-surface-muted hover:bg-brand-light hover:border-brand/30 hover:text-brand text-text-main text-xs font-semibold rounded-xl border border-surface-border flex items-center gap-1.5 transition-all"
                  >
                    <Plus size={14} />
                    {act.title}
                  </button>
                ))}
              </div>
            </Card>
          )}

          <DataTable
            columns={evaluatorColumns}
            data={evaluations}
            searchPlaceholder="Search submitted reviews..."
            searchKey="candidate"
            emptyTitle="No Evaluations Logged"
            emptyDescription="You haven't completed any candidate evaluations yet."
          />
        </div>
      ) : (
        // Candidate view
        <DataTable
          columns={candidateColumns}
          data={evaluations}
          searchPlaceholder="Search reviews received..."
          searchKey="evaluator"
          emptyTitle="No Feedback Received"
          emptyDescription="You haven't received any validation evaluations yet. Your reviews will appear here."
        />
      )}

      {/* Evaluate Candidate Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Activity Approval Review"
        size="md"
      >
        <form className="space-y-5 mt-2" onSubmit={handleSubmitEvaluation}>
          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Select Activity <span className="text-semantic-error">*</span>
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => {
                const act = pendingActivities.find(a => a.id === e.target.value)
                setSelectedActivityId(e.target.value)
                if (act) setSelectedCandidateId(act.user_id)
              }}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer"
              required
            >
              <option value="">Choose activity...</option>
              {pendingActivities.map(act => (
                <option key={act.id} value={act.id}>
                  {act.title} ({act.user?.name})
                </option>
              ))}
            </select>
            {selectedActivityId && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  disabled={detailsLoading}
                  onClick={() => handleViewActivityDetails(selectedActivityId)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand/80 disabled:opacity-50 transition-colors"
                >
                  {detailsLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Eye size={13} className="stroke-[2.5]" />
                  )}
                  View Submission Details & Evidence
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Action <span className="text-semantic-error">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-text-main cursor-pointer">
                <input 
                  type="radio" 
                  value="Approved" 
                  checked={actionType === 'Approved'} 
                  onChange={(e) => setActionType(e.target.value)} 
                  className="h-4 w-4 text-brand focus:ring-brand"
                />
                Approve
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-main cursor-pointer">
                <input 
                  type="radio" 
                  value="Rejected" 
                  checked={actionType === 'Rejected'} 
                  onChange={(e) => setActionType(e.target.value)} 
                  className="h-4 w-4 text-brand focus:ring-brand"
                />
                Reject
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Review Remarks / Comments <span className="text-semantic-error">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light h-24 resize-none"
              placeholder="Provide a reason for approval or rejection..."
              required
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              isLoading={submitting}
              icon={<Send size={16} />}
            >
              {submitting ? 'Submitting...' : 'Submit Decision'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedEval}
        onClose={() => setSelectedEval(null)}
        title="Evaluation Report Details"
        size="md"
      >
        {selectedEval && (
          <div className="space-y-6 mt-2">
            <div className="flex justify-between items-center bg-surface-muted p-4 rounded-xl border border-surface-border">
              <div>
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">
                  {isEvaluatorView ? 'Candidate' : 'Evaluator'}
                </p>
                <p className="text-sm font-semibold text-text-main">
                  {isEvaluatorView ? selectedEval.candidate?.name : selectedEval.evaluator?.name}
                </p>
              </div>
              <Badge variant={selectedEval.recommendation ? 'success' : 'warning'}>
                {selectedEval.recommendation ? 'Recommended for Promotion' : 'Feedback Only'}
              </Badge>
            </div>

            <div className="space-y-5 text-sm font-medium">
              <div className="bg-brand-light/30 border border-brand/20 p-5 rounded-xl">
                <p className="text-xs text-brand uppercase font-bold tracking-wider mb-2">Remarks</p>
                <p className="text-text-main italic leading-relaxed font-medium">"{selectedEval.remarks}"</p>
              </div>
            </div>

            <div className="pt-5 border-t border-surface-border flex items-center justify-between text-xs text-text-muted font-semibold">
              <span>PILOT ASSESSMENT</span>
              <span>{new Date(selectedEval.created_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        activity={selectedActivity}
      />

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
