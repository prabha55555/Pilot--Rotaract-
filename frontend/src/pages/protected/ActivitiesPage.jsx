import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { supabase } from '../../services/supabase'
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
  
  // File Upload State
  const [photos, setPhotos] = useState([])
  const [pdfReport, setPdfReport] = useState(null)
  
  // Edit existing files tracking
  const [existingPhotos, setExistingPhotos] = useState([])
  const [existingPdf, setExistingPdf] = useState(null)
  const [photosToDelete, setPhotosToDelete] = useState([])
  const [pdfToDelete, setPdfToDelete] = useState(null)

  const [submitting, setSubmitting] = useState(false)

  // Filters State
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const avenues = ['Club Service', 'Community Service', 'Professional Development', 'International Service']
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
    setPhotos([])
    setPdfReport(null)
    setExistingPhotos([])
    setExistingPdf(null)
    setPhotosToDelete([])
    setPdfToDelete(null)
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
          await api.deleteStorageFile(id, fileItem.file_url).catch(() => {})
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
      await api.updateActivityStatus(activityId, 'Submitted')
      showToast('Activity submitted for review!')
      fetchActivities()
    } catch (err) {
      console.error(err)
      showToast('Failed to submit activity', 'error')
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
    if (!title || !avenue || !projectType || !projectMode || !location || !description || !startDate || !endDate || !projectChair) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    if (description.length > 1000) {
      showToast('Project description must be 1000 characters or less', 'error')
      return
    }

    if (photos.length === 0 && existingPhotos.length === 0) {
      showToast('Please upload at least one project photo.', 'error')
      return
    }

    setSubmitting(true)
    try {
      // 1. Delete files marked for deletion (via backend)
      for (const p of photosToDelete) {
        await api.deleteStorageFile(editingActivity.id, p.file_url).catch(() => {})
        await api.deleteActivityFile(p.id)
      }

      if (pdfToDelete) {
        await api.deleteStorageFile(editingActivity.id, pdfToDelete.file_url).catch(() => {})
        await api.deleteActivityFile(pdfToDelete.id)
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
        status: editingActivity?.status === 'Rejected' ? 'Submitted' : (editingActivity?.status || 'Submitted')
      }

      let resultActivity
      if (editingActivity) {
        resultActivity = await api.updateActivity(editingActivity.id, activityData)
        showToast('Project updated and resubmitted successfully!')
      } else {
        resultActivity = await api.createActivity(activityData)
        showToast('Project created and submitted for review!')
      }

      // 3. Upload new photos
      for (const p of photos) {
        await api.uploadFile(resultActivity.id, p)
      }

      // 4. Upload new PDF report
      if (pdfReport) {
        await api.uploadFile(resultActivity.id, pdfReport)
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
      render: (row) => <span className="text-xs text-text-muted font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      sortable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'Approved' ? 'success' :
          row.status === 'Rejected' ? 'error' :
          row.status === 'Submitted' ? 'warning' :
          row.status === 'Pending Review' ? 'warning' :
          row.status === 'Resubmitted' ? 'warning' :
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
        const isPending = ['Submitted', 'Pending Review', 'Resubmitted'].includes(row.status)
        const isDraft = row.status === 'Draft'
        const isRejected = row.status === 'Rejected'
        const isApproved = row.status === 'Approved'

        const canEdit = isDraft || isPending || isRejected
        const canDelete = isDraft || isPending
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
                title="Submit for review"
                className="p-2 bg-green-50 text-success hover:bg-success hover:text-white rounded-lg transition-all"
              >
                <Check size={14} className="stroke-[2.5]" />
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => handleOpenEditModal(row)}
                title={isRejected ? "Edit & Resubmit" : "Edit Submission"}
                className="p-2 bg-blue-50 text-brand hover:bg-brand hover:text-white rounded-lg transition-all"
              >
                <Edit2 size={14} className="stroke-[2.5]" />
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
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
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
          
          {/* ── Section 1: Basic Information ── */}
          <div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
              <ClipboardList size={16} className="text-brand" />
              Basic Information
            </h3>
            <div className="space-y-4">
              {/* Project Name */}
              <div className="relative">
                <label className={labelClass}>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass + " pr-10"}
                    placeholder="Project Name *"
                    required
                  />
                  <FileText size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Avenue / Project Type / Project Mode — 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    Avenue <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={avenue}
                    onChange={(e) => setAvenue(e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Avenue *</option>
                    {avenues.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Project Type *</option>
                    {projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    Project Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={projectMode}
                    onChange={(e) => setProjectMode(e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Project Mode *</option>
                    {projectModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={labelClass}>
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass + " pr-10"}
                    placeholder="Location *"
                    required
                  />
                  <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Project Description with Character Counter */}
              <div>
                <label className={labelClass}>
                  Project Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) setDescription(e.target.value)
                    }}
                    className={inputClass + " h-28 resize-none"}
                    placeholder="Project Description *"
                    required
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-gray-400 font-semibold">
                    {description.length}/1000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Schedule Information ── */}
          <div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">
              Schedule Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Project Leadership ── */}
          <div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">
              Project Leadership
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Project Chair <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projectChair}
                    onChange={(e) => setProjectChair(e.target.value)}
                    className={inputClass + " pr-10"}
                    placeholder="Project Chair *"
                    required
                  />
                  <UserIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Project Chair Contact
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={projectChairContact}
                    onChange={(e) => setProjectChairContact(e.target.value)}
                    className={inputClass + " pr-10"}
                    placeholder="Project Chair Contact"
                  />
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 4: Project Evidence ── */}
          <div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">
              Project Evidence & Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Photo Uploads Section */}
              <div className="space-y-4">
                <label className={labelClass}>
                  Project Photos <span className="text-red-500">*</span>
                </label>
                <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 relative hover:border-brand/40 hover:bg-brand/5 transition-all group cursor-pointer font-outfit">
                  <input
                    type="file"
                    multiple
                    onChange={handlePhotoSelect}
                    accept=".jpg,.jpeg,.png,.webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={20} className="text-text-muted" />
                  <div className="text-center pointer-events-none">
                    <p className="text-xs font-semibold text-text-main">
                      <span className="text-brand">Upload photos</span> or drag & drop
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">JPG, PNG, WEBP (Max 1MB per image)</p>
                  </div>
                </div>

                {/* Previews & Existing Photos List */}
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {/* Existing Photos */}
                  {existingPhotos.map(p => (
                    <div key={p.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={p.file_url} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingPhoto(p)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* New Selected Photos Previews */}
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={URL.createObjectURL(p)} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPhoto(idx)}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PDF Report Upload Section */}
              <div className="space-y-4">
                <label className={labelClass}>
                  PDF Project Report (Optional)
                </label>
                {!existingPdf && !pdfReport ? (
                  <div className="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 relative hover:border-brand/40 hover:bg-brand/5 transition-all group cursor-pointer font-outfit">
                    <input
                      type="file"
                      onChange={handlePdfSelect}
                      accept=".pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileText size={20} className="text-text-muted" />
                    <div className="text-center pointer-events-none">
                      <p className="text-xs font-semibold text-text-main">
                        <span className="text-brand">Upload PDF Report</span> or drag & drop
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">PDF Format (Max 5MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={20} className="text-red-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-text-main truncate max-w-[200px]">
                        {pdfReport ? pdfReport.name : existingPdf.file_name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="p-1.5 hover:bg-gray-200 rounded-lg text-semantic-error transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

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
                editingActivity ? 'Update Project' : 'Create Project'
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
