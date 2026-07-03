import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const send = async (payload) => {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email')
    return
  }
  if (!process.env.RESEND_FROM_EMAIL) {
    console.warn('[email] RESEND_FROM_EMAIL not set — skipping email')
    return
  }
  const { data, error } = await resend.emails.send(payload)
  if (error) {
    console.error('[email] Resend error:', JSON.stringify(error))
    throw error
  }
  return data
}

// Email 1: Owner notified when high-score tenant sends interest
export const notifyOwnerHighScore = async ({ ownerEmail, ownerName, tenantName, score, listingLocation }) => {
  return send({
    from: process.env.RESEND_FROM_EMAIL,
    to: ownerEmail,
    subject: `High compatibility tenant interested in your room — ${score}/100`,
    html: `
      <h2>Hi ${ownerName},</h2>
      <p><strong>${tenantName}</strong> has expressed interest in your listing at <strong>${listingLocation}</strong>.</p>
      <p>Their compatibility score is <strong>${score}/100</strong> — a strong match!</p>
      <p>Login to accept or decline their request.</p>
    `
  })
}

// Email 2: Tenant notified when owner accepts or declines
export const notifyTenantDecision = async ({ tenantEmail, tenantName, ownerName, listingLocation, status }) => {
  const accepted = status === 'accepted'
  return send({
    from: process.env.RESEND_FROM_EMAIL,
    to: tenantEmail,
    subject: `Your interest in ${listingLocation} was ${status}`,
    html: `
      <h2>Hi ${tenantName},</h2>
      <p>Your interest in the room at <strong>${listingLocation}</strong> (listed by ${ownerName}) has been <strong>${status}</strong>.</p>
      ${accepted
        ? '<p>You can now chat with the owner directly. Login to start the conversation!</p>'
        : '<p>Keep browsing — there are more great listings waiting for you.</p>'
      }
    `
  })
}
