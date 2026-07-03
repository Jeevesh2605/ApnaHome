import { db } from '../config/supabase.js'

// Load chat history for an accepted interest
export const getChatHistory = async (req, res) => {
  try {
    const { interestId } = req.params
    const userId = req.user.id

    // Verify user is part of this chat
    const { data: interest } = await db
      .from('interests')
      .select('tenant_id, listing_id, status, listings(owner_id)')
      .eq('id', interestId).single()

    if (!interest) return res.status(404).json({ message: 'Interest not found' })
    if (interest.status !== 'accepted')
      return res.status(403).json({ message: 'Chat not unlocked yet' })
    if (interest.tenant_id !== userId && interest.listings.owner_id !== userId)
      return res.status(403).json({ message: 'Not part of this chat' })

    const { data: messages, error } = await db
      .from('messages')
      .select('*, users(name)')
      .eq('interest_id', interestId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Mark unread messages as read
    await db.from('messages')
      .update({ is_read: true })
      .eq('interest_id', interestId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    res.status(200).json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Mark messages as read while chat is open
export const markAsRead = async (req, res) => {
  try {
    const { interestId } = req.params
    const userId = req.user.id

    await db.from('messages')
      .update({ is_read: true })
      .eq('interest_id', interestId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    res.status(200).json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
