import { db } from '../config/supabase.js'

// Owner fetches only their own listings
export const getOwnerListings = async (req, res) => {
  try {
    const { data, error } = await db
      .from('listings')
      .select('*')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Owner creates a listing
export const createListing = async (req, res) => {
  try {
    const { title, location, rent, available_from, room_type, furnishing, description, image_url } = req.body
    const owner_id = req.user.id

    const { data, error } = await db
      .from('listings')
      .insert({ owner_id, title, location, rent, available_from, room_type, furnishing, description, image_url })
      .select().single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Tenant browses listings (filter by location + budget)
export const getListings = async (req, res) => {
  try {
    const { location, min_rent, max_rent } = req.query

    let query = db.from('listings').select('*, users(name, email)').eq('is_filled', false)

    if (location) query = query.ilike('location', `%${location}%`)
    if (min_rent) query = query.gte('rent', Number(min_rent))
    if (max_rent) query = query.lte('rent', Number(max_rent))

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get single listing
export const getListing = async (req, res) => {
  try {
    const { data, error } = await db
      .from('listings').select('*, users(name, email)')
      .eq('id', req.params.id).single()

    if (error || !data) return res.status(404).json({ message: 'Listing not found' })
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Owner updates listing
export const updateListing = async (req, res) => {
  try {
    const { data: listing } = await db
      .from('listings').select('owner_id').eq('id', req.params.id).single()

    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    if (listing.owner_id !== req.user.id)
      return res.status(403).json({ message: 'Not your listing' })

    const { data, error } = await db
      .from('listings').update(req.body).eq('id', req.params.id).select().single()

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Owner marks listing as filled
export const markFilled = async (req, res) => {
  try {
    const { data: listing } = await db
      .from('listings').select('owner_id').eq('id', req.params.id).single()

    if (listing.owner_id !== req.user.id)
      return res.status(403).json({ message: 'Not your listing' })

    await db.from('listings').update({ is_filled: true }).eq('id', req.params.id)
    res.status(200).json({ message: 'Listing marked as filled' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Owner deletes listing
export const deleteListing = async (req, res) => {
  try {
    const { data: listing } = await db
      .from('listings').select('owner_id').eq('id', req.params.id).single()

    if (listing.owner_id !== req.user.id)
      return res.status(403).json({ message: 'Not your listing' })

    await db.from('listings').delete().eq('id', req.params.id)
    res.status(200).json({ message: 'Listing deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
