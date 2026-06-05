import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

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

    req.user = decoded
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
