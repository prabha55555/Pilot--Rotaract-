import express from 'express'
import { supabase } from '../config/supabase.js'
import { authMiddleware } from '../middleware/auth.js'
import { createNotification, notifyRole } from '../utils/notifications.js'

const router = express.Router()

const isColumnMissingError = (err) => {
  if (!err) return false
  const msg = err.message || ''
  const code = err.code || ''
  const hint = err.hint || ''
  return (
    code === '42703' || 
    msg.includes('column') || 
    msg.includes('action_type') || 
    msg.includes('schema cache') || 
    hint.includes('action_type')
  )
}

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
    const { email, name, club, role, batch, password, phone, pilot_id } = req.body
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required to create a new user account' })
    }

    if (!pilot_id) {
      return res.status(400).json({ error: 'Pilot ID is required' })
    }

    // Check Pilot ID uniqueness
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('pilot_id', pilot_id)
      .maybeSingle()

    if (checkError) throw checkError
    if (existingUser) {
      return res.status(400).json({ error: 'Pilot ID must be unique across the system' })
    }
    
    // 1. Create user in Supabase Auth via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) throw authError

    // 2. Insert into public users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          pilot_id,
          email,
          name,
          club,
          role,
          batch,
          phone,
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
    const { pilot_id } = req.body
    if (pilot_id) {
      // Check Pilot ID uniqueness (excluding current user)
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('pilot_id', pilot_id)
        .neq('id', req.params.id)
        .maybeSingle()

      if (checkError) throw checkError
      if (existingUser) {
        return res.status(400).json({ error: 'Pilot ID must be unique across the system' })
      }
    }

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

    console.log('🔄 [promote route] promoterRole:', promoterRole, 'promoterId:', promoterId, 'candidateId:', userId, 'requested newRole:', newRole)

    if (promoterRole !== 'SuperAdmin' && promoterRole !== 'Admin') {
      return res.status(403).json({ error: 'Only administrators can promote users.' })
    }

    // Get candidate profile to check old role
    const { data: candidate, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('🔄 [promote route] candidate fetched:', candidate, 'fetchError:', fetchError)

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
    const promoRecord = {
      user_id: userId,
      old_role: candidate.role,
      new_role: newRole,
      promoted_by: promoterId || 'abc55e97-99d1-43d2-9585-18e28283c620',
      promoted_at: new Date().toISOString(),
    }

    let promotionData, promotionError
    const { data: dataWithAction, error: errWithAction } = await supabase
      .from('promotions')
      .insert([{ ...promoRecord, action_type: 'Promotion' }])
      .select()
      .single()

    if (errWithAction && isColumnMissingError(errWithAction)) {
      const { data: dataNoAction, error: errNoAction } = await supabase
        .from('promotions')
        .insert([promoRecord])
        .select()
        .single()
      
      promotionData = dataNoAction
      promotionError = errNoAction
    } else {
      promotionData = dataWithAction
      promotionError = errWithAction
    }

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

// Revert user promotion
router.post('/:id/revert', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id
    const promoterRole = req.user?.role
    const promoterId = req.user?.id

    if (promoterRole !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Only Super Admins are authorized to revert promotions.' })
    }

    // Fetch candidate profile
    const { data: candidate, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !candidate) {
      return res.status(404).json({ error: 'Candidate not found.' })
    }

    // Find the latest promotion record for this candidate
    // where new_role matches the candidate's current role
    let lastPromo, promoError
    const { data: promoWithAction, error: errWithAction } = await supabase
      .from('promotions')
      .select('*')
      .eq('user_id', userId)
      .eq('new_role', candidate.role)
      .eq('action_type', 'Promotion')
      .order('promoted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (errWithAction && isColumnMissingError(errWithAction)) {
      const { data: promoNoAction, error: errNoAction } = await supabase
        .from('promotions')
        .select('*')
        .eq('user_id', userId)
        .eq('new_role', candidate.role)
        .order('promoted_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      lastPromo = promoNoAction
      promoError = errNoAction
    } else {
      lastPromo = promoWithAction
      promoError = errWithAction
    }

    if (promoError) throw promoError

    const previousRole = lastPromo
      ? lastPromo.old_role
      : (candidate.role === 'SuperAdmin' ? 'Admin' :
         candidate.role === 'Admin' ? 'DT' :
         candidate.role === 'DT' ? 'DTD' : null)

    if (!previousRole) {
      return res.status(400).json({ error: 'No promotion history found to revert for this role.' })
    }

    // If reverting to DTD, status goes back to 'Active', otherwise remains 'Promoted'
    const newStatus = previousRole === 'DTD' ? 'Active' : 'Promoted'

    // Update user role and status
    const { data: userData, error: userUpdateError } = await supabase
      .from('users')
      .update({
        role: previousRole,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (userUpdateError) throw userUpdateError

    // Record reversion in promotions table
    const reversionRecord = {
      user_id: userId,
      old_role: candidate.role,
      new_role: previousRole,
      promoted_by: promoterId,
      promoted_at: new Date().toISOString(),
    }

    let reversionData, reversionError
    const { data: revWithAction, error: revErrWithAction } = await supabase
      .from('promotions')
      .insert([{ ...reversionRecord, action_type: 'Reversion' }])
      .select()
      .single()

    if (revErrWithAction && isColumnMissingError(revErrWithAction)) {
      const { data: revNoAction, error: revErrNoAction } = await supabase
        .from('promotions')
        .insert([reversionRecord])
        .select()
        .single()
      
      reversionData = revNoAction
      reversionError = revErrNoAction
    } else {
      reversionData = revWithAction
      reversionError = revErrWithAction
    }

    if (reversionError) throw reversionError

    // Send notifications
    await createNotification(
      userId,
      'Role Reverted ⚠️',
      `Your role has been reverted from ${candidate.role} to ${previousRole} by the Super Admin.`,
      'role_reversion',
      reversionData.id
    )

    const auditMsg = `Rtr. ${userData.name}'s role was reverted from ${candidate.role} to ${previousRole} by Super Admin ${req.user?.email || 'system'}.`
    await notifyRole('SuperAdmin', 'Trainer Role Reverted', auditMsg, 'role_reversion', reversionData.id)
    await notifyRole('Admin', 'Trainer Role Reverted', auditMsg, 'role_reversion', reversionData.id)

    res.json({ user: userData, reversion: reversionData })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
