import { db } from '../config/supabase.js'

// Tenant creates/updates their profile
export const upsertProfile = async (req, res) => {
  try {
    const { preferred_location, budget_min, budget_max, move_in_date } = req.body
    const tenant_id = req.user.id

    const { data, error } = await db
      .from('tenant_profiles')
      .upsert({ tenant_id, preferred_location, budget_min, budget_max, move_in_date })
      .select().single()

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get tenant's own profile
export const getProfile = async (req, res) => {
  try {
    const { data, error } = await db
      .from('tenant_profiles').select('*').eq('tenant_id', req.user.id).single()

    if (error || !data) return res.status(404).json({ message: 'Profile not found' })
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
