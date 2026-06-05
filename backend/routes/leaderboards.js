import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Get leaderboard
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params

    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('role', role)
      .order('rank', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
