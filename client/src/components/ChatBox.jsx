import { useEffect, useRef, useState } from 'react'
import { Send, Smile } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

export default function ChatBox({ messages, currentUserId, onSend }) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
    setShowEmoji(false)
  }

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-brown-muted text-sm py-8">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMe ? 'bg-amber text-brown rounded-br-none' : 'bg-white border border-border text-brown rounded-bl-none'}`}>
                {msg.content}
              </div>
              <span className="text-xs text-brown-muted mt-1 px-1">
                {msg.users?.name} · {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="relative">
        {showEmoji && (
          <div className="absolute bottom-[80px] left-4 z-50 shadow-lg rounded-lg">
            <EmojiPicker onEmojiClick={onEmojiClick} theme="light" skinTonesDisabled />
          </div>
        )}
        <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-3 bg-cream">
          <button 
            type="button" 
            onClick={() => setShowEmoji(!showEmoji)} 
            className="p-3 text-brown-muted hover:text-brown bg-white border border-border rounded-xl transition-colors"
          >
            <Smile size={20} />
          </button>
          <input
            className="input flex-1"
            placeholder="Type a message…"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button type="submit" className="btn-primary px-4 py-3">
            <Send size={18}/>
          </button>
        </form>
      </div>
    </div>
  )
}
