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
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,        // set in Render dashboard: https://apnahome-client.onrender.com
  'http://localhost:5173',        // Vite dev server
  'http://localhost:4173',        // Vite preview
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // allow REST tools (Postman, curl) or known origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
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
