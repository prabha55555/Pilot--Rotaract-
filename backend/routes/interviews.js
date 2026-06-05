import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Create interview
router.post('/', async (req, res) => {
  try {
    const { candidateId, scheduledDate } = req.body

    const { data, error } = await supabase
      .from('interviews')
      .insert([
        {
          candidate_id: candidateId,
          status: 'Pending',
          interview_date: scheduledDate,
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

// Get interviews
router.get('/', async (req, res) => {
  try {
    const { status } = req.query

    let query = supabase.from('interviews').select('*')

    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update interview
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes, communicationNotes, leadershipNotes, facilitationNotes } = req.body

    const { data, error } = await supabase
      .from('interviews')
      .update({ 
        status,
        overall_remarks: notes,
        communication_notes: communicationNotes,
        leadership_notes: leadershipNotes,
        facilitation_notes: facilitationNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
