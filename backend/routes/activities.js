import express from 'express'
import { supabase } from '../config/supabase.js'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import { createNotification, notifyRole } from '../utils/notifications.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Create activity
router.post('/', async (req, res) => {
  try {
    const {
      title, category, description, outcome, userId, status,
      avenue, project_type, project_mode, location,
      start_date, end_date, project_chair, project_chair_contact
    } = req.body

    const { data, error } = await supabase
      .from('activities')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          title,
          category: category || 'Event Conducted',
          description,
          outcome,
          avenue,
          project_type,
          project_mode,
          location,
          start_date,
          end_date,
          project_chair,
          project_chair_contact,
          status: status || 'Draft',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Send notifications if immediately submitted
    if (data.status === 'Submitted') {
      const { data: userProfile } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single()
      
      const candidateName = userProfile?.name || 'A candidate'
      const titleMsg = 'New Activity Submitted'
      const detailMsg = `${candidateName} submitted a new activity: "${title}"`
      await notifyRole('DT', titleMsg, detailMsg, 'activity_submitted', data.id)
      await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', data.id)
    }

    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get activities
router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query

    let query = supabase.from('activities').select('*')

    if (userId) query = query.eq('user_id', userId)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get activity by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update activity status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body

    // Fetch activity to get candidate's profile
    const { data: activity } = await supabase
      .from('activities')
      .select('*, user:users(name)')
      .eq('id', req.params.id)
      .single()

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found.' })
    }

    const { data, error } = await supabase
      .from('activities')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    const candidateId = activity.user_id
    const candidateName = activity.user?.name || 'A candidate'

    if (status === 'Submitted') {
      const titleMsg = 'Activity Submitted'
      const detailMsg = `${candidateName} submitted activity: "${activity.title}"`
      await notifyRole('DT', titleMsg, detailMsg, 'activity_submitted', data.id)
      await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', data.id)
    } else if (status === 'Approved') {
      await createNotification(
        candidateId,
        'Activity Approved! 🎉',
        `Your activity "${activity.title}" has been approved by the evaluation board.`,
        'activity_approved',
        data.id
      )
      const adminMsg = `Activity "${activity.title}" by ${candidateName} has been approved.`
      await notifyRole('SuperAdmin', 'Activity Approved', adminMsg, 'activity_approved', data.id)
      await notifyRole('Admin', 'Activity Approved', adminMsg, 'activity_approved', data.id)
    } else if (status === 'Rejected') {
      await createNotification(
        candidateId,
        'Activity Action Required ⚠️',
        `Your activity "${activity.title}" requires revisions or has been rejected.`,
        'activity_rejected',
        data.id
      )
    }

    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update activity details
router.put('/:id', async (req, res) => {
  try {
    const {
      title, category, description, outcome, status,
      avenue, project_type, project_mode, location,
      start_date, end_date, project_chair, project_chair_contact
    } = req.body
    
    const updateData = {
      updated_at: new Date().toISOString()
    }
    // Only include fields that are actually provided
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (description !== undefined) updateData.description = description
    if (outcome !== undefined) updateData.outcome = outcome
    if (status !== undefined) updateData.status = status
    if (avenue !== undefined) updateData.avenue = avenue
    if (project_type !== undefined) updateData.project_type = project_type
    if (project_mode !== undefined) updateData.project_mode = project_mode
    if (location !== undefined) updateData.location = location
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (project_chair !== undefined) updateData.project_chair = project_chair
    if (project_chair_contact !== undefined) updateData.project_chair_contact = project_chair_contact

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Send notifications if resubmitted
    if (status === 'Submitted') {
      const { data: activity } = await supabase
        .from('activities')
        .select('*, user:users(name)')
        .eq('id', req.params.id)
        .single()
      
      if (activity) {
        const candidateName = activity.user?.name || 'A candidate'
        const titleMsg = 'Activity Resubmitted'
        const detailMsg = `${candidateName} resubmitted activity: "${activity.title}"`
        await notifyRole('DT', titleMsg, detailMsg, 'activity_submitted', activity.id)
        await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', activity.id)
      }
    }

    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ message: 'Activity deleted successfully', data })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Ensure 'activities' storage bucket exists
const ensureBucketExists = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) throw listError

    const hasActivities = buckets.some(b => b.name === 'activities')
    if (!hasActivities) {
      console.log('Bucket "activities" not found. Creating it...')
      const { error: createError } = await supabase.storage.createBucket('activities', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })
      if (createError) throw createError
      console.log('Bucket "activities" created successfully.')
    }
  } catch (err) {
    console.error('Warning: Could not ensure "activities" bucket exists:', err.message)
  }
}

ensureBucketExists()

// Helper: extract the storage path from a Supabase file URL
const extractStoragePath = (fileUrl) => {
  if (!fileUrl) return null
  try {
    // Handles URLs like:
    //   https://<ref>.supabase.co/storage/v1/object/public/activities/<path>
    //   https://<ref>.supabase.co/storage/v1/object/activities/<path>
    //   https://<ref>.supabase.co/storage/v1/object/sign/activities/<path>?token=...
    const url = new URL(fileUrl)
    const match = url.pathname.match(/\/storage\/v1\/object\/(?:public\/|sign\/)?activities\/(.+)/)
    if (match) {
      return decodeURIComponent(match[1].split('?')[0]) // strip query params
    }
  } catch {
    // If not a valid URL, try simple string split as fallback
    const parts = fileUrl.split('/activities/')
    if (parts.length > 1) {
      return decodeURIComponent(parts[parts.length - 1].split('?')[0])
    }
  }
  return null
}

// Get files for an activity
router.get('/:id/files', async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('activity_id', req.params.id)

    if (error) throw error

    // Generate signed URLs for all files stored in Supabase Storage
    const filesWithUrls = await Promise.all(
      (files || []).map(async (file) => {
        const storagePath = extractStoragePath(file.file_url)
        if (storagePath) {
          try {
            const { data: signedData, error: signedError } = await supabase.storage
              .from('activities')
              .createSignedUrl(storagePath, 3600) // 1 hour

            if (!signedError && signedData?.signedUrl) {
              return { ...file, file_url: signedData.signedUrl }
            }
          } catch (urlErr) {
            console.warn(`Signed URL failed for ${storagePath}:`, urlErr.message)
          }
        }
        // Fallback: return original URL (works if bucket is public)
        return file
      })
    )

    res.json(filesWithUrls)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Create file for an activity
router.post('/:id/files', async (req, res) => {
  try {
    const { file_name, file_url, file_type } = req.body
    
    // Defensive check constraint compatibility fallback
    let dbFileType = file_type.toLowerCase()
    if (dbFileType === 'webp') {
      dbFileType = 'png'
    } else if (!['jpg', 'jpeg', 'png', 'pdf'].includes(dbFileType)) {
      dbFileType = 'pdf'
    }

    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          activity_id: req.params.id,
          file_name,
          file_url,
          file_type: dbFileType
        }
      ])
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete file by ID
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .delete()
      .eq('id', req.params.fileId)
      .select()
      .single()

    if (error) throw error
    res.json({ message: 'File deleted successfully', data })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete file from Supabase Storage (called by frontend instead of direct storage access)
router.delete('/:id/storage', async (req, res) => {
  try {
    let { storagePath, fileUrl } = req.body
    
    // If a full URL is passed, extract the storage path from it
    if (!storagePath && fileUrl) {
      storagePath = extractStoragePath(fileUrl)
    }
    
    if (!storagePath) {
      return res.status(400).json({ error: 'storagePath or fileUrl is required' })
    }

    const { error } = await supabase.storage
      .from('activities')
      .remove([storagePath])

    if (error) {
      console.warn('Storage delete warning:', error.message)
      // Don't throw — the file might already be gone
    }

    res.json({ message: 'Storage file deleted' })
  } catch (error) {
    console.error('Storage delete error:', error)
    res.status(400).json({ error: error.message })
  }
})

// Upload file
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const activityId = req.params.id
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const ext = file.originalname.split('.').pop().toLowerCase()
    const fileName = `${activityId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
    
    // Upload file buffer to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('activities')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('activities').getPublicUrl(fileName)

    // Sanitize file type for db constraint compatibility
    let dbFileType = ext
    if (dbFileType === 'webp') {
      dbFileType = 'png'
    } else if (!['jpg', 'jpeg', 'png', 'pdf'].includes(dbFileType)) {
      dbFileType = 'pdf'
    }

    // Insert into files table
    const { data: fileRecord, error: insertError } = await supabase
      .from('files')
      .insert([
        {
          activity_id: activityId,
          file_name: file.originalname,
          file_url: publicUrl,
          file_type: dbFileType
        }
      ])
      .select()
      .single()

    if (insertError) throw insertError

    res.status(201).json(fileRecord)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(400).json({ error: error.message })
  }
})

export default router
