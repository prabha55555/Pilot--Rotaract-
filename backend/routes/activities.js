import express from 'express'
import { supabase } from '../config/supabase.js'
import { v4 as uuidv4 } from 'uuid'

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

    const { data, error } = await supabase
      .from('activities')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
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

// Upload file
router.post('/:id/upload', async (req, res) => {
  try {
    const activityId = req.params.id
    // File upload logic would go here with multer
    res.json({ message: 'File upload endpoint' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
