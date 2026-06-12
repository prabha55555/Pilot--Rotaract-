import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import activityRoutes from './routes/activities.js'
import evaluationRoutes from './routes/evaluations.js'

import leaderboardRoutes from './routes/leaderboards.js'
import promotionRoutes from './routes/promotions.js'
import reportRoutes from './routes/reports.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/activities', activityRoutes)
app.use('/evaluations', evaluationRoutes)

app.use('/leaderboards', leaderboardRoutes)
app.use('/promotions', promotionRoutes)
app.use('/reports', reportRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'PILOT Backend is running' })
})

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`PILOT Backend server running on http://localhost:${PORT}`)
})
