import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { supabase } from '../config/supabase.js'

dotenv.config()

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    // Verify token with Supabase public key (in production, use proper verification)
    const decoded = jwt.decode(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Fetch database profile to obtain custom user role ('SuperAdmin', 'Admin', etc.)
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', decoded.sub || decoded.id)
      .single()

    console.log('🔑 [authMiddleware] Decoded sub:', decoded.sub, 'dbUser:', dbUser, 'dbError:', dbError)

    if (dbError || !dbUser) {
      return res.status(401).json({ error: 'User profile not found in directory.' })
    }

    req.user = {
      ...decoded,
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
    }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
