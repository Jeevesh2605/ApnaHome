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
app.use(cors())
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
