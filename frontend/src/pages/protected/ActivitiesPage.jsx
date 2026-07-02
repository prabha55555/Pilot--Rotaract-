import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { supabase } from '../../services/supabase'
import { uploadToCloudinary } from '../../services/cloudinary'
import {
  Plus, Edit2, Trash2, Check, FileCheck, ArrowUpRight,
  Search, Filter, X, Eye, FileText, Upload, MapPin, Phone, User as UserIcon, ClipboardList
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Card } from '../../components/ui/Card'
import { formatDateIST, formatIST } from '../../utils/date'
import { Button } from '../../components/ui/Button'
import { ActivityDetailsModal } from '../../components/ui/ActivityDetailsModal'

export default function ActivitiesPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Details Modal State
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [avenue, setAvenue] = useState('')
  const [projectType, setProjectType] = useState('')
  const [projectMode, setProjectMode] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [projectChair, setProjectChair] = useState('')
  const [projectChairContact, setProjectChairContact] = useState('')
  const [mom, setMom] = useState('')
  const [hoursConducted, setHoursConducted] = useState('')

  // Two-Stage workflow state fields
  const [expectedDuration, setExpectedDuration] = useState('')
  const [objectives, setObjectives] = useState('')
  const [expectedParticipants, setExpectedParticipants] = useState('')
  const [numParticipants, setNumParticipants] = useState('')
  const [eventStatus, setEventStatus] = useState('Conducted') // 'Conducted' | 'Cancelled'
  const [cancellationReason, setCancellationReason] = useState('')
  const [additionalRemarks, setAdditionalRemarks] = useState('')
  const [isCompletionMode, setIsCompletionMode] = useState(false)

  // File Upload State
  const [photos, setPhotos] = useState([])
  const [pdfReport, setPdfReport] = useState(null)

  // Edit existing files tracking
  const [existingPhotos, setExistingPhotos] = useState([])
  const [existingPdf, setExistingPdf] = useState(null)
  const [photosToDelete, setPhotosToDelete] = useState([])
  const [pdfToDelete, setPdfToDelete] = useState(null)

  // Poster Upload States
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreviewUrl, setPosterPreviewUrl] = useState('')
  const [existingPosterUrl, setExistingPosterUrl] = useState('')

  const [submitting, setSubmitting] = useState(false)

  // Filters State
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const avenues = ['Club Service', 'Community Service', 'Orientation', 'Professional Development', 'International Service']
  const projectTypes = ['Self', 'Rotary', 'Interact', 'Other Rotaract Clubs', 'Sister Clubs', 'NGOs', 'Other clubs (Exclusive for Campus Based)']
  const projectModes = ['Offline', 'Online']

  const fetchActivities = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await api.listActivities(user.id)
      setActivities(data || [])
    } catch (err) {
      console.error(err)
      showToast('Failed to load activities', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()

    // Subscribe to realtime database changes for synchronization
    const activitiesChannel = supabase
      .channel(`activities-user-${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchActivities()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(activitiesChannel)
    }
  }, [user])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const resetForm = () => {
    setTitle('')
    setAvenue('')
    setProjectType('')
    setProjectMode('')
    setLocation('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setProjectChair('')
    setProjectChairContact('')
    setMom('')
    setHoursConducted('')
    setExpectedDuration('')
    setObjectives('')
    setExpectedParticipants('')
    setNumParticipants('')
    setEventStatus('Conducted')
    setCancellationReason('')
    setAdditionalRemarks('')
    setIsCompletionMode(false)
    setPhotos([])
    setPdfReport(null)
    setExistingPhotos([])
    setExistingPdf(null)
    setPhotosToDelete([])
    setPdfToDelete(null)
    setPosterFile(null)
    setPosterPreviewUrl('')
    setExistingPosterUrl('')
  }

  const handleOpenCreateModal = () => {
    setEditingActivity(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (activity) => {
    resetForm()
    setEditingActivity(activity)
    setTitle(activity.title)
    setAvenue(activity.avenue || '')
    setProjectType(activity.project_type || '')
    setProjectMode(activity.project_mode || '')
    setLocation(activity.location || '')
    setDescription(activity.description || '')
    setStartDate(activity.start_date ? new Date(activity.start_date).toISOString().slice(0, 16) : '')
    setEndDate(activity.end_date ? new Date(activity.end_date).toISOString().slice(0, 16) : '')
    setProjectChair(activity.project_chair || '')
    setProjectChairContact(activity.project_chair_contact || '')
    setMom(activity.mom || '')
    setHoursConducted(activity.hours_conducted !== undefined && activity.hours_conducted !== null ? String(activity.hours_conducted) : '')

    // Workflow values initialization
    setExpectedDuration(activity.expected_duration !== undefined && activity.expected_duration !== null ? String(activity.expected_duration) : '')
    setObjectives(activity.objectives || '')
    setExpectedParticipants(activity.expected_participants !== undefined && activity.expected_participants !== null ? String(activity.expected_participants) : '')
    setNumParticipants(activity.num_participants !== undefined && activity.num_participants !== null ? String(activity.num_participants) : '')
    setEventStatus(activity.event_status || 'Conducted')
    setCancellationReason(activity.cancellation_reason || '')
    setAdditionalRemarks(activity.additional_remarks || '')
    setExistingPosterUrl(activity.poster_url || '')

    // Switch to completion mode if the event has been proposed & approved
    const isPostProposal = ['Planned', 'Under Review', 'Event Conducted', 'Event Cancelled'].includes(activity.status)
    setIsCompletionMode(isPostProposal)

    // Fetch associated files
    try {
      const filesData = await api.getActivityFiles(activity.id)
      const oldPhotos = filesData?.filter(f => ['jpg', 'jpeg', 'png', 'webp'].includes(f.file_type.toLowerCase())) || []
      const oldPdf = filesData?.find(f => f.file_type.toLowerCase() === 'pdf') || null

      setExistingPhotos(oldPhotos)
      setExistingPdf(oldPdf)
    } catch (err) {
      console.error('Error fetching files for edit:', err)
      showToast('Error loading previously uploaded files', 'error')
    }

    setIsModalOpen(true)
  }

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity submission?')) return
    try {
      // Fetch and delete files from storage via backend
      const filesData = await api.getActivityFiles(id)
      if (filesData) {
        for (const fileItem of filesData) {
          // The backend handles extracting storage path and deleting from storage
          await api.deleteStorageFile(id, fileItem.file_url).catch(() => { })
        }
      }

      await api.deleteActivity(id)
      showToast('Activity deleted successfully')
      fetchActivities()
    } catch (err) {
      console.error(err)
      showToast('Failed to delete activity', 'error')
    }
  }

  const handleSubmitReview = async (activityId) => {
    try {
      await api.updateActivityStatus(activityId, 'Planned')
      showToast('Event planned successfully!')
      fetchActivities()
    } catch (err) {
      console.error(err)
      showToast('Failed to plan event', 'error')
    }
  }

  // File selection handlers
  const handlePhotoSelect = (e) => {
    const selected = Array.from(e.target.files)
    const validPhotos = []

    selected.forEach(f => {
      const ext = f.name.split('.').pop().toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        showToast(`File "${f.name}" is not a supported format (JPG/PNG/WEBP).`, 'error')
        return
      }
      if (f.size > 1024 * 1024) {
        showToast(`Image "${f.name}" exceeds the 1MB size limit.`, 'error')
        return
      }
      validPhotos.push(f)
    })

    setPhotos(prev => [...prev, ...validPhotos])
    e.target.value = ''
  }

  const handlePdfSelect = (e) => {
    const f = e.target.files[0]
    if (f) {
      const ext = f.name.split('.').pop().toLowerCase()
      if (ext !== 'pdf') {
        showToast('Only PDF files are allowed.', 'error')
        e.target.value = ''
        return
      }
      if (f.size > 5 * 1024 * 1024) {
        showToast('PDF Report exceeds the 5MB size limit.', 'error')
        e.target.value = ''
        return
      }
      setPdfReport(f)
    }
    e.target.value = ''
  }

  const handlePosterSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        showToast('File format is not supported (JPG/PNG/WEBP only).', 'error')
        e.target.value = ''
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Poster image exceeds the 2MB size limit.', 'error')
        e.target.value = ''
        return
      }
      setPosterFile(file)
      setPosterPreviewUrl(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  const handleRemovePoster = () => {
    setPosterFile(null)
    setPosterPreviewUrl('')
    setExistingPosterUrl('')
  }

  const handleRemoveExistingPhoto = (p) => {
    setExistingPhotos(prev => prev.filter(item => item.id !== p.id))
    setPhotosToDelete(prev => [...prev, p])
  }

  const handleRemoveNewPhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  const handleRemovePdf = () => {
    if (pdfReport) {
      setPdfReport(null)
    } else if (existingPdf) {
      setPdfToDelete(existingPdf)
      setExistingPdf(null)
    }
  }

  const handleOpenDetailsModal = (activity) => {
    setSelectedActivity(activity)
    setIsDetailsOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!isCompletionMode) {
      // Proposal Validation
      if (!title || !avenue || !projectType || !projectMode || !location || !description || !startDate || !endDate || !projectChair || !projectChairContact || !expectedDuration || !objectives || !expectedParticipants) {
        showToast('Please fill in all required proposal fields', 'error')
        return
      }

      // Project Chair Name Validation: only alphabetic characters and spaces
      if (!/^[a-zA-Z\s]+$/.test(projectChair.trim())) {
        showToast('Project Chair Name must contain only alphabetic characters and spaces', 'error')
        return
      }

      // Project Chair Contact Validation: exactly 10 digits
      if (!/^\d{10}$/.test(projectChairContact)) {
        showToast('Project Chair Contact must contain exactly 10 digits and numbers only', 'error')
        return
      }

      // Event Poster Upload validation (MANDATORY)
      const hasPoster = posterFile || existingPosterUrl
      if (!hasPoster) {
        showToast('Event Poster is required to submit the activity.', 'error')
        return
      }
    } else {
      // Completion/Cancellation Validation
      if (eventStatus === 'Conducted') {
        if (!mom || !hoursConducted || !numParticipants) {
          showToast('Please fill in MOM, hours conducted, and actual participants', 'error')
          return
        }
        if (photos.length === 0 && existingPhotos.length === 0) {
          showToast('Please upload at least one project photo.', 'error')
          return
        }
      } else {
        if (!cancellationReason) {
          showToast('Please select a cancellation reason', 'error')
          return
        }
      }
    }

    if (description.length > 1000) {
      showToast('Project description must be 1000 characters or less', 'error')
      return
    }

    setSubmitting(true)
    try {
      // 1. Delete files marked for deletion (via backend)
      for (const p of photosToDelete) {
        await api.deleteStorageFile(editingActivity.id, p.file_url).catch(() => { })
        await api.deleteActivityFile(p.id)
      }

      if (pdfToDelete) {
        await api.deleteStorageFile(editingActivity.id, pdfToDelete.file_url).catch(() => { })
        await api.deleteActivityFile(pdfToDelete.id)
      }

      // Upload poster if selected
      let uploadedPosterUrl = existingPosterUrl
      if (posterFile) {
        const cloudPoster = await uploadToCloudinary(posterFile)
        uploadedPosterUrl = cloudPoster.url
      }

      // 2. Save/Update activity meta
      const activityData = {
        title,
        category: 'Event Conducted',
        avenue,
        project_type: projectType,
        project_mode: projectMode,
        location,
        description,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        project_chair: projectChair,
        project_chair_contact: projectChairContact,
        userId: user.id,

        // Proposal Stage Fields
        expected_duration: expectedDuration ? parseFloat(expectedDuration) : null,
        objectives,
        expected_participants: expectedParticipants ? parseInt(expectedParticipants) : null,

        // Completion Stage Fields
        mom: isCompletionMode && eventStatus === 'Conducted' ? mom : null,
        hours_conducted: isCompletionMode && eventStatus === 'Conducted' && hoursConducted ? parseFloat(hoursConducted) : null,
        num_participants: isCompletionMode && eventStatus === 'Conducted' && numParticipants ? parseInt(numParticipants) : null,
        event_status: isCompletionMode ? eventStatus : 'Conducted',
        cancellation_reason: isCompletionMode && eventStatus === 'Cancelled' ? cancellationReason : null,
        additional_remarks: additionalRemarks,
        poster_url: uploadedPosterUrl || null,

        // Dynamic status workflow setting
        status: isCompletionMode
          ? (eventStatus === 'Cancelled' ? 'Event Cancelled' : 'Event Conducted')
          : (editingActivity?.status === 'Rejected' ? 'Planned' : (editingActivity?.status || 'Planned'))
      }

      let resultActivity
      if (editingActivity) {
        resultActivity = await api.updateActivity(editingActivity.id, activityData)
        showToast(isCompletionMode ? 'Project completion details submitted for verification!' : 'Project proposal updated successfully!')
      } else {
        resultActivity = await api.createActivity(activityData)
        showToast('Project planned and submitted successfully!')
      }

      // 3. Upload new photos (Stage 2 Conducted only)
      if (isCompletionMode && eventStatus === 'Conducted') {
        for (const p of photos) {
          const cloudFile = await uploadToCloudinary(p)
          await api.createActivityFile(resultActivity.id, {
            file_name: cloudFile.original_name,
            file_url: cloudFile.url,
            file_type: cloudFile.format
          })
        }

        // 4. Upload new PDF report
        if (pdfReport) {
          const cloudPdf = await uploadToCloudinary(pdfReport)
          await api.createActivityFile(resultActivity.id, {
            file_name: cloudPdf.original_name,
            file_url: cloudPdf.url,
            file_type: 'pdf'
          })
        }
      }

      setIsModalOpen(false)
      resetForm()
      fetchActivities()
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to save activity', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter activities
  const filteredActivities = activities.filter(act => {
    const matchesStatus = statusFilter ? act.status === statusFilter : true
    const matchesCategory = categoryFilter ? (act.avenue === categoryFilter || act.category === categoryFilter) : true
    return matchesStatus && matchesCategory
  })

  // Columns definition for DataTable
  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-text-main text-sm block">{row.title}</span>
          <span className="text-xs text-text-muted font-medium block mt-0.5 line-clamp-1">{row.description || 'No description'}</span>
        </div>
      )
    },
    {
      header: 'Avenue',
      accessor: 'avenue',
      sortable: true,
      render: (row) => <Badge variant="blue">{row.avenue || row.category || '-'}</Badge>
    },
    {
      header: 'Date Created',
      accessor: 'created_at',
      sortable: true,
      render: (row) => <span className="text-xs text-text-muted font-medium">{formatIST(row.created_at)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'Approved' ? 'success' :
            row.status === 'Event Conducted' ? 'warning' :
              row.status === 'Event Cancelled' ? 'warning' :
                row.status === 'Rejected' ? 'error' :
                  row.status === 'Cancellation Approved' ? 'error' :
                    row.status === 'Cancellation Rejected' ? 'error' :
                      ['Submitted for Approval', 'Under Review', 'Resubmitted'].includes(row.status) ? 'warning' :
                        row.status === 'Planned' ? 'brand' :
                          row.status === 'Draft' ? 'draft' :
                            'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => {
        const isDraft = row.status === 'Draft'
        const isRejected = row.status === 'Rejected'
        const isPlanned = row.status === 'Planned'

        // Can edit if not yet approved or currently pending review
        const canEdit = !['Approved', 'Cancellation Approved', 'Event Conducted', 'Event Cancelled'].includes(row.status)
        const canDelete = ['Draft', 'Planned'].includes(row.status)
        const canSubmit = isDraft

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenDetailsModal(row)}
              title="View Project Details"
              className="p-2 bg-gray-50 text-text-muted hover:bg-gray-200 hover:text-text-main rounded-lg transition-all"
            >
              <Eye size={14} className="stroke-[2.5]" />
            </button>

            {canSubmit && (
              <button
                onClick={() => handleSubmitReview(row.id)}
                title="Submit proposal for approval"
                className="p-2 bg-green-50 text-success hover:bg-success hover:text-white rounded-lg transition-all"
              >
                <Check size={14} className="stroke-[2.5]" />
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => handleOpenEditModal(row)}
                title={isPlanned ? "Submit Completion / Cancellation" : (isRejected ? "Edit & Resubmit" : "Edit Submission")}
                className="p-2 bg-blue-50 text-brand hover:bg-brand hover:text-white rounded-lg transition-all"
              >
                {isPlanned ? <FileCheck size={14} className="stroke-[2.5]" /> : <Edit2 size={14} className="stroke-[2.5]" />}
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => handleDeleteActivity(row.id)}
                title="Delete Submission"
                className="p-2 bg-red-50 text-semantic-error hover:bg-semantic-error hover:text-white rounded-lg transition-all"
              >
                <Trash2 size={14} className="stroke-[2.5]" />
              </button>
            )}
          </div>
        )
      }
    }
  ]

  // Shared input styles
  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-main focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all placeholder:text-gray-400"
  const selectClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-main focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer appearance-none"
  const labelClass = "block text-xs font-semibold text-gray-500 tracking-wide mb-1.5 uppercase"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Activity Documents"
        subtitle="Upload and manage your project activity reports, posters, and submissions."
        actionText="Upload Activity"
        onActionClick={handleOpenCreateModal}
        actionIcon={Plus}
      />

      {/* Filter Options */}
      <Card className="p-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-main font-outfit">
          <Filter size={18} className="text-text-muted" />
          Filter Submissions
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
          >
            <option value="">All Avenues</option>
            {avenues.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-xs font-semibold text-text-main focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Planned">Planned</option>
            <option value="Event Conducted">Event Conducted</option>
            <option value="Event Cancelled">Event Cancelled</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Resubmitted">Resubmitted</option>
          </select>
          {(statusFilter || categoryFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
              icon={<X size={14} />}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Main Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredActivities}
          searchPlaceholder="Search projects..."
          searchKey="title"
          emptyTitle="No Activities Found"
          emptyDescription="You haven't added any activities matching these filters."
        />
      )}

      {/* ========= PROJECT ACTIVITY FORM MODAL ========= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'Edit Project Activity' : 'Upload Project Activity Document'}
        size="xl"
      >
        <form className="space-y-8" onSubmit={handleFormSubmit}>

          {/* ── Conditional Form Fields based on Stage ── */}
          {!isCompletionMode ? (
            // Stage 1: Event Proposal Form
            <div className="space-y-6">
              {/* Proposal Info Header */}
              <div className="p-4 bg-brand-light/35 border border-brand/20 rounded-xl">
                <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-1">Stage 1: Event Proposal</h4>
                <p className="text-xs text-text-light">Submit the planned details of your upcoming event to your superior for approval.</p>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <div className="relative">
                  <label className={labelClass}>Project Title / Event Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    placeholder="E.g. District Trainer's Seminar"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Avenue <span className="text-red-500">*</span></label>
                    <select value={avenue} onChange={(e) => setAvenue(e.target.value)} className={selectClass} required>
                      <option value="" disabled hidden>Select Avenue</option>
                      {avenues.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Project Type <span className="text-red-500">*</span></label>
                    <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={selectClass} required>
                      <option value="" disabled hidden>Select Project Type</option>
                      {projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Project Mode <span className="text-red-500">*</span></label>
                    <select value={projectMode} onChange={(e) => setProjectMode(e.target.value)} className={selectClass} required>
                      <option value="" disabled hidden>Select Project Mode</option>
                      {projectModes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Venue / Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                    placeholder="Venue / Address *"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Event Description <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={(e) => { if (e.target.value.length <= 1000) setDescription(e.target.value); }}
                      className={inputClass + " h-24 resize-none"}
                      placeholder="Brief event description *"
                      required
                    />
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400 font-bold">{description.length}/1000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Proposed Start Date & Time <span className="text-red-500">*</span></label>
                    <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Proposed End Date & Time <span className="text-red-500">*</span></label>
                    <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Expected Duration (Hours) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={expectedDuration}
                      onChange={(e) => setExpectedDuration(e.target.value)}
                      className={inputClass}
                      placeholder="Hours (e.g. 2)"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Expected Participants <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={expectedParticipants}
                      onChange={(e) => setExpectedParticipants(e.target.value)}
                      className={inputClass}
                      placeholder="Count (e.g. 50)"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Project Chair <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={projectChair}
                      onChange={(e) => setProjectChair(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                      className={inputClass}
                      placeholder="Project Chair Name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Project Chair Contact <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={projectChairContact}
                      onChange={(e) => setProjectChairContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={inputClass}
                      placeholder="Contact number"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Objectives of the Event <span className="text-red-500">*</span></label>
                    <textarea
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                      className={inputClass + " h-12"}
                      placeholder="E.g. Introduce mentoring skills..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Additional Remarks</label>
                  <textarea
                    value={additionalRemarks}
                    onChange={(e) => setAdditionalRemarks(e.target.value)}
                    className={inputClass + " h-12"}
                    placeholder="Remarks or special requirements..."
                  />
                </div>

                {/* Poster Upload Field */}
                <div className="space-y-2">
                  <label className={labelClass}>Event Poster <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all font-semibold text-xs text-text-main shadow-sm">
                      <Upload size={14} className="text-[#003DA5]" />
                      {posterFile || existingPosterUrl ? 'Change Poster' : 'Upload Poster'}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePosterSelect}
                      />
                    </label>
                    {(posterFile || existingPosterUrl) && (
                      <button
                        type="button"
                        onClick={handleRemovePoster}
                        className="px-3 py-2 bg-red-50 text-semantic-error hover:bg-semantic-error hover:text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Live Poster Preview */}
                  {(posterPreviewUrl || existingPosterUrl) && (
                    <div className="mt-3 relative w-48 aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                      <img
                        src={posterPreviewUrl || existingPosterUrl}
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : (
            // Stage 2: Event Completion / Cancellation Form
            <div className="space-y-6">

              {/* Proposal Summary Card */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Proposal Reference Summary</span>
                <h4 className="text-sm font-bold text-text-main leading-none">{title}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-text-muted">
                  <div>Avenue: <span className="text-brand">{avenue || '-'}</span></div>
                  <div>Venue: <span className="text-text-main">{location || '-'}</span></div>
                  <div>Expected Duration: <span className="text-text-main">{expectedDuration ? `${expectedDuration} hr` : '-'}</span></div>
                </div>
              </div>

              {/* Event Cancellation Toggle */}
              <div className="p-4 bg-gray-100/50 border border-gray-200 rounded-xl space-y-3">
                <label className={labelClass}>Event Execution Status <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-text-main cursor-pointer">
                    <input
                      type="radio"
                      name="eventStatus"
                      value="Conducted"
                      checked={eventStatus === 'Conducted'}
                      onChange={() => setEventStatus('Conducted')}
                      className="h-4 w-4 text-brand focus:ring-brand"
                    />
                    Event Conducted
                  </label>
                  <label className="flex items-center gap-2 text-sm font-bold text-text-main cursor-pointer">
                    <input
                      type="radio"
                      name="eventStatus"
                      value="Cancelled"
                      checked={eventStatus === 'Cancelled'}
                      onChange={() => setEventStatus('Cancelled')}
                      className="h-4 w-4 text-brand focus:ring-brand"
                    />
                    Event Cancelled
                  </label>
                </div>
              </div>

              {eventStatus === 'Conducted' ? (
                // Conducted Inputs
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Actual Hours Conducted <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={hoursConducted}
                        onChange={(e) => setHoursConducted(e.target.value)}
                        className={inputClass}
                        placeholder="Hours (e.g. 2.5)"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Actual Number of Participants <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={numParticipants}
                        onChange={(e) => setNumParticipants(e.target.value)}
                        className={inputClass}
                        placeholder="Participants count"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>MOM (Minutes of Meeting / Event Summary) <span className="text-red-500">*</span></label>
                    <textarea
                      value={mom}
                      onChange={(e) => setMom(e.target.value)}
                      className={inputClass + " h-24 resize-none"}
                      placeholder="Record summaries, discussions, feedback, and key points of the event..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Photos upload */}
                    <div>
                      <label className={labelClass}>Project Photos <span className="text-red-500">*</span></label>
                      <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 relative hover:border-brand/40 hover:bg-brand/5 transition-all cursor-pointer font-outfit">
                        <input type="file" multiple onChange={handlePhotoSelect} accept=".jpg,.jpeg,.png,.webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload size={18} className="text-text-muted" />
                        <div className="text-center pointer-events-none">
                          <p className="text-[11px] font-bold text-text-main"><span className="text-brand">Upload photos</span></p>
                          <p className="text-[9px] text-gray-500">Max 1MB per image</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5 mt-2">
                        {existingPhotos.map(p => (
                          <div key={p.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={p.file_url} className="w-full h-full object-cover" alt="Preview" />
                            <button type="button" onClick={() => handleRemoveExistingPhoto(p)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        {photos.map((p, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="Preview" />
                            <button type="button" onClick={() => handleRemoveNewPhoto(idx)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PDF upload */}
                    <div>
                      <label className={labelClass}>PDF Project Report (Optional)</label>
                      {!existingPdf && !pdfReport ? (
                        <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 relative hover:border-brand/40 hover:bg-brand/5 transition-all cursor-pointer font-outfit">
                          <input type="file" onChange={handlePdfSelect} accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <FileText size={18} className="text-text-muted" />
                          <div className="text-center pointer-events-none">
                            <p className="text-[11px] font-bold text-text-main"><span className="text-brand">Upload Report</span></p>
                            <p className="text-[9px] text-gray-500">PDF Format (Max 5MB)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText size={18} className="text-red-500 flex-shrink-0" />
                            <span className="text-xs font-semibold text-text-main truncate max-w-[150px]">{pdfReport ? pdfReport.name : existingPdf.file_name}</span>
                          </div>
                          <button type="button" onClick={handleRemovePdf} className="p-1 text-semantic-error hover:bg-gray-200 rounded">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Additional Completion Remarks</label>
                    <textarea
                      value={additionalRemarks}
                      onChange={(e) => setAdditionalRemarks(e.target.value)}
                      className={inputClass + " h-12"}
                      placeholder="Any final notes about event execution..."
                    />
                  </div>
                </div>
              ) : (
                // Cancelled Inputs
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Cancellation Reason <span className="text-red-500">*</span></label>
                    <select
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className={selectClass}
                      required
                    >
                      <option value="">Select cancellation reason...</option>
                      <option value="Speaker unavailable">Speaker unavailable</option>
                      <option value="Venue issues">Venue issues</option>
                      <option value="Low participation">Low participation</option>
                      <option value="Scheduling conflicts">Scheduling conflicts</option>
                      <option value="Weather conditions">Weather conditions</option>
                      <option value="Administrative reasons">Administrative reasons</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Explain Cancellation / Remarks <span className="text-red-500">*</span></label>
                    <textarea
                      value={additionalRemarks}
                      onChange={(e) => setAdditionalRemarks(e.target.value)}
                      className={inputClass + " h-20 resize-none"}
                      placeholder="Please details the reasons why this event proposal was cancelled..."
                      required
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-3 bg-white border border-gray-300 text-text-main text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-brand text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                editingActivity
                  ? (isCompletionMode ? 'Submit Completion' : 'Update Proposal')
                  : 'Submit Proposal'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reusable Activity Details Modal */}
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
