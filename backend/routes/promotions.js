import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Get promotions
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('promoted_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
