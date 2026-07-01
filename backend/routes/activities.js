import express from 'express'
import { supabase } from '../config/supabase.js'
import { v4 as uuidv4 } from 'uuid'
import { createNotification, notifyRole } from '../utils/notifications.js'
import { generateActivityReportPDF } from '../utils/pdfGenerator.js'
import { uploadBufferToCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

// Create activity
router.post('/', async (req, res) => {
  try {
    const {
      title, category, description, outcome, userId, status,
      avenue, project_type, project_mode, location,
      start_date, end_date, project_chair, project_chair_contact,
      mom, hours_conducted,
      expected_duration, objectives, expected_participants, num_participants,
      event_status, cancellation_reason, additional_remarks
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
          mom,
          hours_conducted,
          expected_duration,
          objectives,
          expected_participants,
          num_participants,
          event_status: event_status || 'Conducted',
          cancellation_reason,
          additional_remarks,
          status: status || 'Planned',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Send notifications if immediately submitted
    if (data.status === 'Planned' || data.status === 'Under Review' || data.status === 'Resubmitted') {
      const { data: userProfile } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', userId)
        .single()
      
      const candidateName = userProfile?.name || 'A candidate'
      const candidateRole = userProfile?.role || 'DTD'
      const titleMsg = data.status === 'Planned' ? 'New Event Planned 📅' : 'New Activity Submitted'
      const detailMsg = data.status === 'Planned' 
        ? `${candidateName} planned an upcoming event: "${title}"`
        : `${candidateName} submitted completion details: "${title}"`
      
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

    if (status === 'Planned' || status === 'Event Conducted' || status === 'Event Cancelled') {
      const titleMsg = status === 'Planned' ? 'New Event Planned 📅' : (status === 'Event Conducted' ? 'Event Execution Submitted 📝' : 'Event Cancellation Submitted ⚠️')
      const detailMsg = status === 'Planned' 
        ? `${candidateName} planned an upcoming event: "${activity.title}"`
        : (status === 'Event Conducted' 
            ? `${candidateName} submitted execution details for: "${activity.title}"`
            : `${candidateName} submitted cancellation details for: "${activity.title}"`)
      
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

      // --- PDF Report Auto-Generation & Cloudinary Upload (Conducted events only) ---
      if (activity.event_status === 'Conducted') {
        try {
          console.log(`[Report Gen] Initiating PDF report for Activity ID: ${data.id}`)
          
          // 1. Fetch full activity details with user profiles
          const { data: fullActivity, error: fetchErr } = await supabase
            .from('activities')
            .select('*, user:users(name, pilot_id, club, role)')
            .eq('id', data.id)
            .single()
          
          if (fetchErr) throw fetchErr

          // 2. Fetch associated files list
          const { data: files, error: filesErr } = await supabase
            .from('files')
            .select('*')
            .eq('activity_id', data.id)
          
          if (filesErr) throw filesErr

          // 3. Fetch latest approval evaluation details (to extract Remarks and Approver name)
          const { data: evals, error: evalsErr } = await supabase
            .from('evaluations')
            .select('*, evaluator:users!evaluator_id(name)')
            .eq('activity_id', data.id)
            .eq('recommendation', true)
            .order('created_at', { ascending: false })
            .limit(1)

          const approverName = evals?.[0]?.evaluator?.name || 'Evaluation Board'
          const remarks = evals?.[0]?.remarks || 'Reviewed and approved by evaluation board.'
          const approvalDate = evals?.[0]?.created_at || new Date().toISOString()

          // 4. Compile PDF kit buffer
          const pdfBuffer = await generateActivityReportPDF({
            activity: fullActivity,
            files: files || [],
            approverName,
            remarks,
            approvalDate
          })

          // 5. Upload buffer directly to Cloudinary
          console.log('[Report Gen] Uploading generated PDF to Cloudinary...')
          const uploadResult = await uploadBufferToCloudinary(pdfBuffer, data.id)
          console.log('[Report Gen] Cloudinary Upload Success:', uploadResult.secure_url)

          // 6. Update database record with the Cloudinary URL
          const { error: updateReportErr } = await supabase
            .from('activities')
            .update({ report_url: uploadResult.secure_url })
            .eq('id', data.id)
          
          if (updateReportErr) throw updateReportErr
          console.log('✅ Approved activity report generated, uploaded, and linked successfully.')
        } catch (pdfErr) {
          console.error('❌ Failed to auto-generate activity report:', pdfErr.message)
        }
      }
      // ------------------------------------------------------
    } else if (status === 'Rejected') {
      await createNotification(
        candidateId,
        'Activity Action Required ⚠️',
        `Your activity "${activity.title}" requires revisions or has been rejected.`,
        'activity_rejected',
        data.id
      )
    } else if (status === 'Cancellation Approved') {
      await createNotification(
        candidateId,
        'Event Cancellation Approved ⚠️',
        `Your event cancellation request for "${activity.title}" has been approved.`,
        'activity_cancelled',
        data.id
      )
      const adminMsg = `Event "${activity.title}" by ${candidateName} has been cancelled.`
      await notifyRole('SuperAdmin', 'Event Cancelled', adminMsg, 'activity_cancelled', data.id)
      await notifyRole('Admin', 'Event Cancelled', adminMsg, 'activity_cancelled', data.id)
    } else if (status === 'Cancellation Rejected') {
      await createNotification(
        candidateId,
        'Event Cancellation Rejected ⚠️',
        `Your event cancellation request for "${activity.title}" has been rejected.`,
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
      start_date, end_date, project_chair, project_chair_contact,
      mom, hours_conducted,
      expected_duration, objectives, expected_participants, num_participants,
      event_status, cancellation_reason, additional_remarks
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
    if (mom !== undefined) updateData.mom = mom
    if (hours_conducted !== undefined) updateData.hours_conducted = hours_conducted
    if (expected_duration !== undefined) updateData.expected_duration = expected_duration
    if (objectives !== undefined) updateData.objectives = objectives
    if (expected_participants !== undefined) updateData.expected_participants = expected_participants
    if (num_participants !== undefined) updateData.num_participants = num_participants
    if (event_status !== undefined) updateData.event_status = event_status
    if (cancellation_reason !== undefined) updateData.cancellation_reason = cancellation_reason
    if (additional_remarks !== undefined) updateData.additional_remarks = additional_remarks

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Send notifications if resubmitted / status updated
    if (status === 'Planned' || status === 'Under Review' || status === 'Resubmitted') {
      const { data: activity } = await supabase
        .from('activities')
        .select('*, user:users(name, role)')
        .eq('id', req.params.id)
        .single()
      
      if (activity) {
        const candidateName = activity.user?.name || 'A candidate'
        const candidateRole = activity.user?.role || 'DTD'
        const titleMsg = status === 'Planned' ? 'New Event Planned 📅' : 'Event Execution Submitted 📝'
        const detailMsg = status === 'Planned'
          ? `${candidateName} planned an upcoming event: "${activity.title}"`
          : `${candidateName} submitted execution details for: "${activity.title}"`
        
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
