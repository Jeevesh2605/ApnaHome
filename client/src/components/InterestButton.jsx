import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { MessageCircle, Send, Loader2 } from 'lucide-react'

export default function InterestButton({ listingId, existingInterest, onSent }) {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const send = async () => {
    setLoading(true)
    try {
      await api.post('/interests', { listing_id: listingId })
      toast.success('Interest sent!')
      onSent?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest')
    } finally {
      setLoading(false)
    }
  }

  if (!existingInterest) {
    return (
      <button onClick={send} disabled={loading} className="btn-primary">
        {loading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
        Express Interest
      </button>
    )
  }

  const status = existingInterest.status
  if (status === 'pending')  return <button disabled className="btn-outline opacity-60 cursor-default">Interest Sent ✓</button>
  if (status === 'declined') return <button disabled className="bg-brown-muted/10 text-brown-muted font-semibold px-6 py-3 rounded-full cursor-default">Declined</button>
  if (status === 'accepted') return (
    <button onClick={() => navigate(`/chat/${existingInterest.id}`)} className="btn-primary bg-green text-white hover:bg-green-dark">
      <MessageCircle size={16}/> Open Chat
    </button>
  )
}
