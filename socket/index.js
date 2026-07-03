import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config({ path: '../api/.env' })

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: '*' }
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

const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => console.log(`Socket server running on port ${PORT}`))
