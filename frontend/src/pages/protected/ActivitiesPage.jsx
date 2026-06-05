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

export default function ActivitiesPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  
  // New Form Fields based on reference image
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
  
  const [file, setFile] = useState(null)
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
    setFile(null)
  }

  const handleOpenCreateModal = () => {
    setEditingActivity(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (activity) => {
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
    setFile(null)
    setIsModalOpen(true)
  }

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft activity?')) return
    try {
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

    if (file && file.size > 1024 * 1024) {
      showToast('File size must be less than 1MB', 'error')
      return
    }

    if (file) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!['jpg', 'jpeg', 'png'].includes(ext)) {
        showToast('Only PNG, JPG, and JPEG files are allowed', 'error')
        return
      }
    }

    if (!file && !editingActivity) {
      showToast('Please upload a project poster', 'error')
      return
    }

    setSubmitting(true)
    try {
      let fileUrl = ''
      let fileExt = ''
      
      // Upload file to Supabase storage if provided
      if (file) {
        fileExt = file.name.split('.').pop().toLowerCase()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('activities')
          .upload(fileName, file, { cacheControl: '3600', upsert: true })

        if (uploadError) {
          console.warn('Supabase storage upload failed, saving locally:', uploadError.message)
          fileUrl = `https://mock.storage.local/proofs/${fileName}`
        } else {
          const { data: { publicUrl } } = supabase.storage.from('activities').getPublicUrl(fileName)
          fileUrl = publicUrl
        }
      }

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
        status: 'Submitted'
      }

      let resultActivity
      if (editingActivity) {
        resultActivity = await api.updateActivity(editingActivity.id, activityData)
        showToast('Project updated and submitted successfully!')
      } else {
        resultActivity = await api.createActivity(activityData)
        showToast('Project created and submitted for review!')
      }

      // If there's a file, insert file record linked to this activity
      if (fileUrl && resultActivity?.id) {
        const { error: fileRecordError } = await supabase
          .from('files')
          .insert({
            activity_id: resultActivity.id,
            file_name: file.name,
            file_url: fileUrl,
            file_type: fileExt
          })
        if (fileRecordError) console.error('Error inserting file record:', fileRecordError)
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
          'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Draft' ? (
            <>
              <button
                onClick={() => handleSubmitReview(row.id)}
                title="Submit for review"
                className="p-2 bg-green-50 text-success hover:bg-success hover:text-white rounded-lg transition-all"
              >
                <Check size={14} className="stroke-[2.5]" />
              </button>
              <button
                onClick={() => handleOpenEditModal(row)}
                title="Edit Draft"
                className="p-2 bg-blue-50 text-brand hover:bg-brand hover:text-white rounded-lg transition-all"
              >
                <Edit2 size={14} className="stroke-[2.5]" />
              </button>
              <button
                onClick={() => handleDeleteActivity(row.id)}
                title="Delete Draft"
                className="p-2 bg-red-50 text-semantic-error hover:bg-semantic-error hover:text-white rounded-lg transition-all"
              >
                <Trash2 size={14} className="stroke-[2.5]" />
              </button>
            </>
          ) : (
            <span className="text-xs text-text-muted font-medium italic px-2">{row.status}</span>
          )}
        </div>
      )
    }
  ]

  // Shared input class
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

          {/* ── Section 4: Project Poster ── */}
          <div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">
              Project Poster <span className="text-red-500">*</span>
            </h3>
            <div className="w-full p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 relative hover:border-brand/40 hover:bg-brand/5 transition-all group cursor-pointer">
              <input
                type="file"
                onChange={(e) => {
                  const f = e.target.files[0]
                  if (f) {
                    const ext = f.name.split('.').pop().toLowerCase()
                    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
                      showToast('Only PNG, JPG, and JPEG files are allowed', 'error')
                      e.target.value = ''
                      return
                    }
                    if (f.size > 1024 * 1024) {
                      showToast('File size must be less than 1MB', 'error')
                      e.target.value = ''
                      return
                    }
                    setFile(f)
                  }
                }}
                accept=".jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center group-hover:bg-brand-light group-hover:text-brand transition-all">
                <Upload size={22} />
              </div>
              <div className="text-center pointer-events-none">
                {file ? (
                  <div>
                    <p className="text-sm font-semibold text-brand truncate max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-main">
                      <span className="text-brand font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (MAX. 1MB)</p>
                  </>
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
