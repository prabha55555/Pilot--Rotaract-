import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Top members report
router.get('/top-members', async (req, res) => {
  try {
    const { role, limit = 10 } = req.query

    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('role', role)
      .order('rank', { ascending: true })
      .limit(parseInt(limit))

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Monthly report
router.get('/monthly', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('created_at')

    if (error) throw error

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const counts = Array(12).fill(0)

    data?.forEach(act => {
      if (act.created_at) {
        const d = new Date(act.created_at)
        const m = d.getMonth()
        if (m >= 0 && m < 12) {
          counts[m] += 1
        }
      }
    })

    const chartData = months.map((name, i) => ({
      name,
      count: counts[i]
    }))

    res.json(chartData)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Promotions report
router.get('/promotions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Export report
router.get('/export', async (req, res) => {
  try {
    const { type, format } = req.query
    // Implement export logic for PDF/Excel
    res.json({ message: `Export ${type} as ${format}` })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
