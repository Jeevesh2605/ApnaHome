import { db } from '../config/supabase.js'
import { notifyOwnerHighScore, notifyTenantDecision } from '../services/email.service.js'

// Tenant sends interest to owner
export const sendInterest = async (req, res) => {
  try {
    const tenant_id = req.user.id
    const { listing_id } = req.body

    // Check if interest already exists
    const { data: existing } = await db
      .from('interests')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('listing_id', listing_id)
      .single()

    if (existing) return res.status(400).json({ message: 'Interest already sent' })

    // Create interest
    const { data: interest, error } = await db
      .from('interests')
      .insert({ tenant_id, listing_id })
      .select().single()

    if (error) throw error

    // Check score — if > 80 send email to owner
    const { data: match } = await db
      .from('matches')
      .select('score')
      .eq('tenant_id', tenant_id)
      .eq('listing_id', listing_id)
      .single()

    if (match && match.score > 80) {
      const { data: tenant } = await db.from('users').select('name').eq('id', tenant_id).single()
      const { data: listing } = await db
        .from('listings').select('location, owner_id').eq('id', listing_id).single()
      const { data: owner } = await db
        .from('users').select('name, email').eq('id', listing.owner_id).single()

      await notifyOwnerHighScore({
        ownerEmail: owner.email,
        ownerName: owner.name,
        tenantName: tenant.name,
        score: match.score,
        listingLocation: listing.location
      }).catch(err => console.warn('Email failed:', err.message))
    }

    res.status(201).json(interest)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Owner responds to interest (accept or decline)
export const respondToInterest = async (req, res) => {
  try {
    const { status } = req.body  // 'accepted' or 'declined'
    const { id } = req.params

    if (!['accepted', 'declined'].includes(status))
      return res.status(400).json({ message: 'Status must be accepted or declined' })

    const { data: interest } = await db
      .from('interests')
      .select('*, listings(location, owner_id), users(name, email)')
      .eq('id', id).single()

    if (!interest) return res.status(404).json({ message: 'Interest not found' })
    if (interest.listings.owner_id !== req.user.id)
      return res.status(403).json({ message: 'Not your listing' })

    await db.from('interests').update({ status }).eq('id', id)

    // Notify tenant of decision
    const { data: owner } = await db
      .from('users').select('name').eq('id', req.user.id).single()

    await notifyTenantDecision({
      tenantEmail: interest.users.email,
      tenantName: interest.users.name,
      ownerName: owner.name,
      listingLocation: interest.listings.location,
      status
    }).catch(err => console.warn('Email failed:', err.message))

    res.status(200).json({ message: `Interest ${status}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get all interests for owner (incoming requests)
export const getOwnerInterests = async (req, res) => {
  try {
    const { data, error } = await db
      .from('interests')
      .select('*, users(name, email), listings(location, rent)')
      .eq('listings.owner_id', req.user.id)

    if (error) throw error

    // Fetch scores and unread counts
    const enriched = await Promise.all(data.map(async (interest) => {
      const { data: match } = await db.from('matches').select('score')
        .eq('tenant_id', interest.tenant_id).eq('listing_id', interest.listing_id).single()
      
      const { count } = await db.from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('interest_id', interest.id)
        .eq('is_read', false)
        .neq('sender_id', req.user.id)

      return { ...interest, score: match?.score || null, unread_count: count || 0 }
    }))

    res.status(200).json(enriched)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get all interests sent by tenant
export const getTenantInterests = async (req, res) => {
  try {
    const { data, error } = await db
      .from('interests')
      .select('*, listings(location, rent, room_type)')
      .eq('tenant_id', req.user.id)

    if (error) throw error

    // Fetch scores and unread counts
    const enriched = await Promise.all(data.map(async (interest) => {
      const { data: match } = await db.from('matches').select('score')
        .eq('tenant_id', interest.tenant_id).eq('listing_id', interest.listing_id).single()
      
      const { count } = await db.from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('interest_id', interest.id)
        .eq('is_read', false)
        .neq('sender_id', req.user.id)

      return { ...interest, score: match?.score || null, unread_count: count || 0 }
    }))

    res.status(200).json(enriched)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
