import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Create evaluation
router.post('/', async (req, res) => {
  try {
    const { candidateId, evaluatorId, remarks, strengths, improvements, recommendation } = req.body

    const { data, error } = await supabase
      .from('evaluations')
      .insert([
        {
          candidate_id: candidateId,
          evaluator_id: evaluatorId,
          remarks,
          strengths,
          improvements,
          recommendation,
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

// Get evaluations for candidate
router.get('/', async (req, res) => {
  try {
    const { candidateId } = req.query

    let query = supabase.from('evaluations').select('*')

    if (candidateId) query = query.eq('candidate_id', candidateId)

    const { data, error } = await query

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
