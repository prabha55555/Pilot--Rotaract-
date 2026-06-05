import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    res.json({
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) throw error

    res.json({ message: 'Password reset email sent' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    // In production, verify token properly
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
