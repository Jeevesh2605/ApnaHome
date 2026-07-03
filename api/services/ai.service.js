import { db } from '../config/supabase.js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ─── Rule-based fallback ─────────────────────────────
const ruleBasedScore = (listing, profile) => {
  let score = 0

  const withinBudget = listing.rent >= profile.budget_min && listing.rent <= profile.budget_max
  if (withinBudget) score += 50

  const locationMatch = listing.location.toLowerCase()
    .includes(profile.preferred_location.toLowerCase())
  if (locationMatch) score += 50

  return {
    score,
    explanation: `Rule-based score: ${withinBudget ? 'Budget matches.' : 'Budget does not match.'} ${locationMatch ? 'Location matches.' : 'Location does not match.'}`,
    is_fallback: true
  }
}

// ─── Groq LLM call ───────────────────────────────────
const llmScore = async (listing, profile) => {
  const prompt = `Given this room listing:
- Location: ${listing.location}
- Rent: ₹${listing.rent}/month
- Room type: ${listing.room_type}
- Furnishing: ${listing.furnishing}
- Available from: ${listing.available_from}

And this tenant profile:
- Preferred location: ${profile.preferred_location}
- Budget: ₹${profile.budget_min} to ₹${profile.budget_max}/month
- Move-in date: ${profile.move_in_date}

Compute a compatibility score from 0 to 100 based on how well this listing matches the tenant's needs.
Return ONLY valid JSON in this exact format, no extra text:
{ "score": <number>, "explanation": "<one sentence reason>" }`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150
    })
  })

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) throw new Error('Empty LLM response')

  const parsed = JSON.parse(content)
  if (typeof parsed.score !== 'number' || !parsed.explanation)
    throw new Error('Invalid LLM response format')

  return { score: parsed.score, explanation: parsed.explanation, is_fallback: false }
}

// ─── Main exported function ───────────────────────────
// Called by match.controller.js
// Checks DB first → if exists return cached → else compute + store
export const getCompatibilityScore = async (tenantId, listingId) => {
  // 1. Check if score already exists in DB
  const { data: existing } = await db
    .from('matches')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('listing_id', listingId)
    .single()

  if (existing) return existing  // return cached score, never recompute

  // 2. Fetch listing and tenant profile
  const { data: listing } = await db.from('listings').select('*').eq('id', listingId).single()
  const { data: profile } = await db.from('tenant_profiles').select('*').eq('tenant_id', tenantId).single()

  if (!listing) throw new Error('Listing not found')
  if (!profile) throw new Error('Tenant profile not found. Please complete your profile first.')

  // 3. Try LLM → fall back to rule-based if it fails
  let result
  try {
    result = await llmScore(listing, profile)
  } catch (err) {
    console.warn('LLM failed, using rule-based fallback:', err.message)
    result = ruleBasedScore(listing, profile)
  }

  // 4. Store result in DB
  const { data: saved, error } = await db
    .from('matches')
    .insert({ tenant_id: tenantId, listing_id: listingId, ...result })
    .select().single()

  if (error) throw error
  return saved
}
