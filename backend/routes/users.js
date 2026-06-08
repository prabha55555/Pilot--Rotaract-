import express from 'express'
import { supabase } from '../config/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import { createNotification, notifyRole } from '../utils/notifications.js'

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
    const { email, name, club, role, batch, password } = req.body
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required to create a new user account' })
    }
    
    // 1. Create user in Supabase Auth via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) throw authError

    // 2. Generate Pilot ID
    const pilotId = `PILOT-${role}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

    // 3. Insert into public users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
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

    if (error) {
      // Clean up Auth user if DB insert fails to maintain consistency
      await supabase.auth.admin.deleteUser(authData.user.id).catch(console.error)
      throw error
    }

    // 4. Send Notifications
    await createNotification(
      data.id, 
      'Welcome to PILOT!', 
      `Your account has been registered as ${role}. You can now sign in using your credentials or Google account.`, 
      'welcome'
    )
    
    await notifyRole(
      'SuperAdmin',
      'New User Registered',
      `User ${name} (${role}) has been added to the directory.`,
      'user_registered',
      data.id
    )

    await notifyRole(
      'Admin',
      'New User Registered',
      `User ${name} (${role}) has been added to the directory.`,
      'user_registered',
      data.id
    )

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
router.patch('/:id/promote', authMiddleware, async (req, res) => {
  try {
    const { newRole } = req.body
    const userId = req.params.id

    const promoterRole = req.user?.role
    const promoterId = req.user?.id

    if (promoterRole !== 'SuperAdmin' && promoterRole !== 'Admin') {
      return res.status(403).json({ error: 'Only administrators can promote users.' })
    }

    // Get candidate profile to check old role
    const { data: candidate, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !candidate) {
      return res.status(404).json({ error: 'Candidate not found.' })
    }

    // If Admin, strictly restrict to DTD -> DT promotion
    if (promoterRole === 'Admin') {
      if (candidate.role !== 'DTD' || newRole !== 'DT') {
        return res.status(403).json({ error: 'Admins are strictly restricted to promoting DTD candidates to DT status.' })
      }
    }

    // Update user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ role: newRole, status: 'Promoted', updated_at: new Date().toISOString() })
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
          old_role: candidate.role,
          new_role: newRole,
          promoted_by: promoterId || 'abc55e97-99d1-43d2-9585-18e28283c620',
          promoted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (promotionError) throw promotionError

    // Send notifications
    await createNotification(
      userId,
      'Promotion Approved! ✈️',
      `Congratulations! You have been promoted from ${candidate.role} to ${newRole}. Your control desk privileges have been updated.`,
      'promotion_approved',
      promotionData.id
    )

    const auditMsg = `Rtr. ${userData.name} was promoted from ${candidate.role} to ${newRole} by admin ${req.user?.email || 'system'}.`
    await notifyRole('SuperAdmin', 'Trainer Promoted', auditMsg, 'role_change', promotionData.id)
    await notifyRole('Admin', 'Trainer Promoted', auditMsg, 'role_change', promotionData.id)

    res.json({ user: userData, promotion: promotionData })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
