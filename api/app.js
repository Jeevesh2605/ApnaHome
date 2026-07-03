import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.route.js'
import listingRoutes from './routes/listing.route.js'
import tenantRoutes from './routes/tenant.route.js'
import interestRoutes from './routes/interest.route.js'
import matchRoutes from './routes/match.route.js'
import chatRoutes from './routes/chat.route.js'

const app = express()

// Allow any localhost port (Vite can use 5173, 5174, etc.)
// and the deployed Vercel client URL set via CLIENT_URL env var
const isAllowedOrigin = (origin) => {
  if (!origin) return true                          // curl / Postman / server-to-server
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true  // any localhost port
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true
  return false
}

app.use(cors({
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true)
    cb(null, false)   // silently block unknown origins
  },
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/tenant', tenantRoutes)
app.use('/api/interests', interestRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/chat', chatRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`API server running on port ${PORT}`))
