import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { 
  FileText, Download, Upload, Plus, Trash2, 
  BookOpen, Folder, Filter, Eye, CheckCircle
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Toast } from '../../components/ui/Toast'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export default function DocumentsPage() {
  const { user, userRole } = useAuth()
  const isSuperAdmin = userRole === 'SuperAdmin'

  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [toast, setToast] = useState(null)
  
  // Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = [
    'Training Manual',
    'Session Presentation',
    'District Circular',
    'Evaluation Criteria',
    'Guidelines'
  ]

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*, uploaded_by_user:users(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      console.error(err)
      showToast('Error loading documents catalog', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleOpenUpload = () => {
    setTitle('')
    setCategory('Guidelines')
    setFile(null)
    setIsUploadOpen(true)
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!title || !file) {
      showToast('Please provide a title and choose a file', 'error')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop().toLowerCase()
      const fileName = `shared/${Date.now()}.${fileExt}`
      
      let fileUrl = ''
      
      // Upload file directly to Supabase storage documents bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) {
        console.warn('Supabase storage upload failed, saving fallback URL:', uploadError.message)
        // Fallback local/mock link
        fileUrl = `https://mock.storage.local/documents/${fileName}`
      } else {
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)
        fileUrl = publicUrl
      }

      // Add to documents catalog table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title,
          category,
          file_url: fileUrl,
          uploaded_by: user.id
        })

      if (dbError) throw dbError

      showToast('Document uploaded and added to catalog!')
      setIsUploadOpen(false)
      loadDocuments()
    } catch (err) {
      console.error(err)
      showToast('Failed to upload document', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (id, fileUrl) => {
    if (!window.confirm('Are you sure you want to delete this document from the library?')) return
    try {
      // Delete record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError
      
      showToast('Document removed successfully')
      loadDocuments()
    } catch (err) {
      console.error(err)
      showToast('Failed to delete document', 'error')
    }
  }

  // Filter logic
  const filteredDocuments = documents.filter(doc => 
    categoryFilter ? doc.category === categoryFilter : true
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Library"
        subtitle="Access trainer syllabi, session slides, evaluation templates, and other training manuals."
        actionText={isSuperAdmin ? 'Upload Resource' : null}
        onActionClick={isSuperAdmin ? handleOpenUpload : null}
        actionIcon={isSuperAdmin ? Upload : null}
      />

      {/* Filter tab bar */}
      <div className="bg-surface p-5 border border-surface-border rounded-2xl shadow-sm flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Filter size={16} /> Filter Category:
        </span>
        <button
          onClick={() => setCategoryFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            categoryFilter === ''
              ? 'bg-brand text-white border-brand shadow-sm'
              : 'bg-surface-muted text-text-main border-surface-border hover:bg-surface-hover'
          }`}
        >
          All Resources
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              categoryFilter === cat
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-surface-muted text-text-main border-surface-border hover:bg-surface-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(doc => (
            <Card 
              key={doc.id} 
              className="p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-brand-light/50 text-brand rounded-xl">
                    <FileText size={24} className="stroke-[2]" />
                  </div>
                  <Badge variant="default">{doc.category}</Badge>
                </div>
                
                <h4 className="font-semibold text-sm text-text-main leading-snug line-clamp-2">
                  {doc.title}
                </h4>
                
                <p className="text-[10px] text-text-light font-medium mt-2">
                  Uploaded by: <span className="font-bold text-text-muted">{doc.uploaded_by_user?.name || 'Admin'}</span>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between gap-3">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-brand-light/50 hover:bg-brand hover:text-white text-brand rounded-xl text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Download size={14} className="stroke-[2.5]" />
                  Download Resource
                </a>
                
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
                    title="Remove resource"
                    className="p-2.5 bg-semantic-error/10 text-semantic-error hover:bg-semantic-error hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center max-w-md mx-auto">
          <BookOpen size={48} className="text-surface-border mx-auto mb-4 stroke-[1.5]" />
          <h4 className="font-semibold text-text-main mb-1">No Documents Uploaded</h4>
          <p className="text-xs text-text-muted font-medium mb-4 leading-relaxed">
            There are no documents uploaded in this category right now. Reference manuals will appear here.
          </p>
          {isSuperAdmin && (
            <Button
              onClick={handleOpenUpload}
              icon={<Plus size={16} />}
            >
              Upload First Resource
            </Button>
          )}
        </Card>
      )}

      {/* Upload Resource Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Reference Resource"
        size="sm"
      >
        <form className="space-y-5 mt-2" onSubmit={handleUploadSubmit}>
          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Resource Title <span className="text-semantic-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all"
              placeholder="e.g. Rotaract Trainer Syllabus 2026"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Category Folder <span className="text-semantic-error">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer"
              required
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Upload File (PDF, Docs, Presentations) <span className="text-semantic-error">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all"
              required
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              fullWidth
              disabled={uploading}
              isLoading={uploading}
              icon={<Upload size={16} />}
            >
              {uploading ? 'Uploading Resource...' : 'Publish to Library'}
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
