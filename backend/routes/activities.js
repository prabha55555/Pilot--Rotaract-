import express from 'express'
import { supabase } from '../config/supabase.js'
import { v4 as uuidv4 } from 'uuid'
import { createNotification, notifyRole } from '../utils/notifications.js'

const router = express.Router()

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
        .select('name, role')
        .eq('id', userId)
        .single()
      
      const candidateName = userProfile?.name || 'A candidate'
      const candidateRole = userProfile?.role || 'DTD'
      const titleMsg = 'New Activity Submitted'
      const detailMsg = `${candidateName} submitted a new activity: "${title}"`
      
      if (candidateRole === 'DTD') {
        await notifyRole('DT', titleMsg, detailMsg, 'activity_submitted', data.id)
        await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', data.id)
      } else if (candidateRole === 'DT') {
        await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', data.id)
        await notifyRole('SuperAdmin', titleMsg, detailMsg, 'activity_submitted', data.id)
      }
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

    let query = supabase.from('activities').select('*, user:users(name, role, club, pilot_id)')

    if (userId) query = query.eq('user_id', userId)
    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('created_at', { ascending: false })

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
      .select('*, user:users(name, role, club, pilot_id)')
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
      .select('*, user:users(name, role)')
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
    const candidateRole = activity.user?.role || 'DTD'

    if (status === 'Submitted') {
      const titleMsg = 'Activity Submitted'
      const detailMsg = `${candidateName} submitted activity: "${activity.title}"`
      
      if (candidateRole === 'DTD') {
        await notifyRole('DT', titleMsg, detailMsg, 'activity_submitted', data.id)
        await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', data.id)
      } else if (candidateRole === 'DT') {
        await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', data.id)
        await notifyRole('SuperAdmin', titleMsg, detailMsg, 'activity_submitted', data.id)
      }
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
        .select('*, user:users(name, role)')
        .eq('id', req.params.id)
        .single()
      
      if (activity) {
        const candidateName = activity.user?.name || 'A candidate'
        const candidateRole = activity.user?.role || 'DTD'
        const titleMsg = 'Activity Resubmitted'
        const detailMsg = `${candidateName} resubmitted activity: "${activity.title}"`
        
        if (candidateRole === 'DTD') {
          await notifyRole('DT', titleMsg, detailMsg, 'activity_submitted', activity.id)
          await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', activity.id)
        } else if (candidateRole === 'DT') {
          await notifyRole('Admin', titleMsg, detailMsg, 'activity_submitted', activity.id)
          await notifyRole('SuperAdmin', titleMsg, detailMsg, 'activity_submitted', activity.id)
        }
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

// Get files for an activity
router.get('/:id/files', async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('activity_id', req.params.id)

    if (error) throw error
    res.json(files || [])
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
    if (!['jpg', 'jpeg', 'png', 'pdf', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'].includes(dbFileType)) {
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

// Delete storage file (Stubbed/Legacy since frontend still calls it to prevent breaks)
router.delete('/:id/storage', async (req, res) => {
  try {
    res.json({ message: 'Cloudinary storage file deletion is managed on the database/client side' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
