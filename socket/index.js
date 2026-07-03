import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../api/.env') })

// Validate required environment variables before starting
const REQUIRED_ENV_VARS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET']
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`[socket] Missing required environment variables: ${missing.join(', ')}`)
  console.error('[socket] Set these in your Render service environment settings.')
  process.exit(1)
}

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:4173',
    ],
    credentials: true,
  },
})

// Middleware: verify JWT before socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('No token'))

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.id)

  // Join a chat room (room = interest ID)
  socket.on('join_room', (interestId) => {
    socket.join(`chat_${interestId}`)
    console.log(`${socket.user.id} joined chat_${interestId}`)
  })

  // Handle new message
  socket.on('send_message', async ({ interestId, content }) => {
    try {
      // Save message to DB
      const { data: message, error } = await db
        .from('messages')
        .insert({
          interest_id: interestId,
          sender_id: socket.user.id,
          content
        })
        .select('*, users(name)')
        .single()

      if (error) throw error

      // Broadcast to everyone in room
      io.to(`chat_${interestId}`).emit('new_message', message)

    } catch (err) {
      socket.emit('error', { message: err.message })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.id)
  })
})

const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, '0.0.0.0', () => console.log(`Socket server running on port ${PORT}`))
