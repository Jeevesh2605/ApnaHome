import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/axios'
import { getSocket, disconnectSocket } from '../lib/socket'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ChatBox from '../components/ChatBox'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

export default function Chat() {
  const { interestId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Load history first
    api.get(`/chat/${interestId}`)
      .then(({ data }) => setMessages(data))
      .catch(err => toast.error(err.response?.data?.message || 'Could not load chat'))
      .finally(() => setLoading(false))

    // Connect socket
    const socket = getSocket()
    socket.connect()
    socket.emit('join_room', interestId)

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg])
      if (msg.sender_id !== user?.id) {
        api.patch(`/chat/${interestId}/read`).catch(console.error)
      }
    })
    socket.on('error', (err) => toast.error(err.message))

    return () => {
      socket.off('new_message')
      socket.off('error')
      disconnectSocket()
    }
  }, [interestId])

  const handleSend = useCallback((content) => {
    const socket = getSocket()
    socket.emit('send_message', { interestId, content })
  }, [interestId])

  if (loading) return <Loader />

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden max-w-3xl w-full mx-auto px-4 py-4">
        <div className="mb-3">
          <h1 className="font-serif text-2xl font-bold text-brown">Chat</h1>
          <p className="text-brown-muted text-sm">Real-time conversation about this listing</p>
        </div>
        <div className="flex-1 card overflow-hidden flex flex-col p-0">
          <ChatBox messages={messages} currentUserId={user?.id} onSend={handleSend}/>
        </div>
      </div>
    </div>
  )
}
