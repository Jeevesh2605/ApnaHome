import { getCompatibilityScore } from '../services/ai.service.js'
import { db } from '../config/supabase.js'

// Tenant requests AI score for a listing
export const getScore = async (req, res) => {
  try {
    const tenantId = req.user.id
    const { listingId } = req.params

    const result = await getCompatibilityScore(tenantId, listingId)
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get all matches for a tenant (their scored listings)
export const getTenantMatches = async (req, res) => {
  try {
    const { data, error } = await db
      .from('matches')
      .select('*, listings(*)')
      .eq('tenant_id', req.user.id)
      .order('score', { ascending: false })

    if (error) throw error
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
