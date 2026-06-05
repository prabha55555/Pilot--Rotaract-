import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Modal } from './Modal'
import { Badge } from './Badge'
import { Button } from './Button'
import { 
  Calendar, MapPin, ClipboardList, User, Phone, 
  FileText, ExternalLink, Download, Clock, MessageSquare 
} from 'lucide-react'

export const ActivityDetailsModal = ({ isOpen, onClose, activity }) => {
  const [files, setFiles] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activity || !isOpen) return

    const fetchDetails = async () => {
      setLoading(true)
      try {
        // 1. Fetch associated files (photos and reports)
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('activity_id', activity.id)
        
        if (filesError) throw filesError
        setFiles(filesData || [])

        // 2. Fetch associated evaluations (remarks, evaluator info)
        const { data: evalsData, error: evalsError } = await supabase
          .from('evaluations')
          .select('*, evaluator:users!evaluator_id(name)')
          .eq('activity_id', activity.id)
          .order('created_at', { ascending: false })

        if (evalsError) throw evalsError
        setEvaluations(evalsData || [])
      } catch (err) {
        console.error('Error fetching activity details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [activity, isOpen])

  if (!activity) return null

  // Group files by type
  const photos = files.filter(f => ['jpg', 'jpeg', 'png', 'webp'].includes(f.file_type.toLowerCase()))
  const pdfReport = files.find(f => f.file_type.toLowerCase() === 'pdf')

  // Date formatting helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Activity details"
      size="xl"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : (
        <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-1">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-text-main font-outfit leading-tight mb-1.5">{activity.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
                <span>{activity.category}</span>
                <span>•</span>
                <span>Avenue: <span className="text-brand">{activity.avenue || '-'}</span></span>
              </div>
            </div>
            <Badge variant={
              activity.status === 'Approved' ? 'success' :
              activity.status === 'Rejected' ? 'error' :
              activity.status === 'Submitted' ? 'warning' :
              activity.status === 'Pending Review' ? 'warning' :
              activity.status === 'Resubmitted' ? 'warning' :
              'default'
            }>
              {activity.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Details & Event Metadata */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ClipboardList size={14} />
                  Project Description
                </h3>
                <p className="text-sm text-text-main leading-relaxed bg-surface-muted p-4 rounded-xl font-medium border border-surface-border whitespace-pre-line">
                  {activity.description || 'No description provided.'}
                </p>
              </div>

              {/* Event Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-surface-border rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Project Metadata</span>
                  <p className="text-xs font-semibold text-text-main">
                    Type: <span className="text-text-muted font-medium">{activity.project_type || '-'}</span>
                  </p>
                  <p className="text-xs font-semibold text-text-main mt-1">
                    Mode: <span className="text-text-muted font-medium">{activity.project_mode || '-'}</span>
                  </p>
                </div>

                <div className="p-4 border border-surface-border rounded-xl flex items-start gap-3">
                  <MapPin size={16} className="text-text-light mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Location</span>
                    <span className="text-xs font-semibold text-text-main">{activity.location || '-'}</span>
                  </div>
                </div>

                <div className="p-4 border border-surface-border rounded-xl flex items-start gap-3 sm:col-span-2">
                  <Calendar size={16} className="text-text-light mt-0.5 flex-shrink-0" />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Start Time</span>
                      <span className="text-xs font-semibold text-text-main">{formatDate(activity.start_date)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">End Time</span>
                      <span className="text-xs font-semibold text-text-main">{formatDate(activity.end_date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supporting Evidence Photos Gallery */}
              {photos.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileText size={14} />
                    Project Photo Evidence ({photos.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((p) => (
                      <a 
                        key={p.id} 
                        href={p.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="relative group aspect-square rounded-xl overflow-hidden border border-surface-border hover:border-brand/40 shadow-sm transition-all"
                      >
                        <img src={p.file_url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" alt="Evidence" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <ExternalLink size={16} />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: PDF Report, Leadership, Status Feed */}
            <div className="space-y-6">
              
              {/* PDF Report Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={14} />
                  Project Report PDF
                </h3>
                {pdfReport ? (
                  <div className="p-4 bg-red-50/20 border border-red-100 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={22} className="text-red-500 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-text-main truncate leading-snug">{pdfReport.file_name}</p>
                        <p className="text-[9px] text-text-muted font-semibold uppercase">PDF Report Document</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={pdfReport.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs font-bold text-text-main rounded-lg transition-all"
                      >
                        <ExternalLink size={12} />
                        Open File
                      </a>
                      <a 
                        href={pdfReport.file_url} 
                        download
                        className="inline-flex items-center justify-center px-3 py-2 bg-brand text-white hover:bg-brand/90 text-xs font-bold rounded-lg transition-all"
                      >
                        <Download size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-text-muted font-medium py-6">
                    No PDF report document was uploaded for this activity.
                  </div>
                )}
              </div>

              {/* Leadership info */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={14} />
                  Project Leadership
                </h3>
                <div className="p-4 border border-surface-border rounded-xl space-y-3 bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-surface-muted text-text-muted flex items-center justify-center">
                      <User size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block leading-none">Project Chair</span>
                      <span className="text-xs font-semibold text-text-main">{activity.project_chair || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-surface-muted text-text-muted flex items-center justify-center">
                      <Phone size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block leading-none">Chair Contact</span>
                      <span className="text-xs font-semibold text-text-main">{activity.project_chair_contact || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluations & Feedback Log */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  Evaluation Remarks
                </h3>
                {evaluations.length > 0 ? (
                  <div className="space-y-3">
                    {evaluations.map((ev) => (
                      <div key={ev.id} className="p-3 border border-surface-border bg-gray-50/50 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-text-main">{ev.evaluator?.name}</span>
                          <Badge variant={ev.status === 'Approved' ? 'success' : 'error'}>
                            {ev.status || (ev.recommendation ? 'Approved' : 'Rejected')}
                          </Badge>
                        </div>
                        <p className="text-text-muted italic leading-relaxed">
                          "{ev.remarks}"
                        </p>
                        <span className="text-[9px] text-text-light font-semibold block pt-1">
                          {new Date(ev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-text-muted font-medium py-6 flex flex-col items-center gap-1.5">
                    <Clock size={16} />
                    Pending trainer review feedback.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button onClick={onClose}>
              Close Details
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
export default ActivityDetailsModal
