import express from 'express'
import { supabase } from '../config/supabase.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const { role, status } = req.query
    
    let query = supabase.from('users').select('*')
    
    if (role) query = query.eq('role', role)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, name, club, role, batch } = req.body
    
    const pilotId = `PILOT-${role}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: uuidv4(),
          pilot_id: pilotId,
          email,
          name,
          club,
          role,
          batch,
          status: 'Active',
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

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Deactivate user
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'Inactive' })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Archive user
router.patch('/:id/archive', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'Archived' })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Promote user
router.patch('/:id/promote', async (req, res) => {
  try {
    const { newRole } = req.body
    const userId = req.params.id

    // Update user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ role: newRole, status: 'Promoted' })
      .eq('id', userId)
      .select()
      .single()

    if (userError) throw userError

    // Record promotion
    const { data: promotionData, error: promotionError } = await supabase
      .from('promotions')
      .insert([
        {
          user_id: userId,
          old_role: userData.role,
          new_role: newRole,
          promoted_by: req.user?.id || 'system',
          promoted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (promotionError) throw promotionError

    res.json({ user: userData, promotion: promotionData })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
