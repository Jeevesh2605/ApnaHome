import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import '../config/firebase.js'
import { getAuth } from 'firebase-admin/auth'
import { db } from '../config/supabase.js'

// Helper: issue our own JWT
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// ─── Manual Register ───────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!['owner', 'tenant'].includes(role))
      return res.status(400).json({ message: 'Role must be owner or tenant' })

    const { data: existing } = await db
      .from('users').select('id').eq('email', email).single()
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: user, error } = await db
      .from('users')
      .insert({ name, email, password: hashedPassword, role, auth_provider: 'manual' })
      .select().single()

    if (error) throw error

    const token = createToken(user)
    res.status(201).json({ token, user: { id: user.id, name, email, role } })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Manual Login ──────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const { data: user } = await db
      .from('users').select('*').eq('email', email).single()

    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.auth_provider === 'google')
      return res.status(400).json({ message: 'This account uses Google login' })

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return res.status(401).json({ message: 'Wrong credentials' })

    const token = createToken(user)
    res.status(200).json({ token, user: { id: user.id, name: user.name, email, role: user.role } })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─── Google Auth ───────────────────────────────────────────────
// Frontend sends Firebase idToken after Google sign-in
// Backend verifies it, upserts user, returns our own JWT
export const googleAuth = async (req, res) => {
  try {
    const { idToken, role } = req.body

    if (!idToken) return res.status(400).json({ message: 'idToken is required' })
    if (role && !['owner', 'tenant'].includes(role))
      return res.status(400).json({ message: 'Role must be owner or tenant' })

    // Step 1: Verify Firebase token
    const decoded = await getAuth().verifyIdToken(idToken)
    const { email, name, uid } = decoded

    // Step 2: Check if user exists by firebase_uid first
    let { data: user } = await db
      .from('users').select('*').eq('firebase_uid', uid).single()

    // Step 2b: Fallback — check by email (e.g. previously registered manually)
    if (!user) {
      const { data: existingByEmail } = await db
        .from('users').select('*').eq('email', email).single()

      if (existingByEmail) {
        // Link their Google UID to the existing account
        const { data: linked, error: linkErr } = await db
          .from('users')
          .update({ firebase_uid: uid, auth_provider: 'google' })
          .eq('id', existingByEmail.id)
          .select().single()
        if (linkErr) throw linkErr
        user = linked
      }
    }

    // Step 3: First time Google login — create user
    if (!user) {
      if (!role) return res.status(400).json({
        message: 'First time login: please provide role (owner or tenant)'
      })

      const { data: newUser, error } = await db
        .from('users')
        .insert({
          name,
          email,
          role,
          auth_provider: 'google',
          firebase_uid: uid
        })
        .select().single()

      if (error) throw error
      user = newUser
    }

    // Step 4: Issue our own JWT — same as manual login from here
    const token = createToken(user)
    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      isNewUser: !user  // frontend can use this to show onboarding
    })

  } catch (err) {
    if (err.code === 'auth/id-token-expired')
      return res.status(401).json({ message: 'Firebase token expired, please login again' })
    if (err.code === 'auth/argument-error')
      return res.status(401).json({ message: 'Invalid Firebase token' })
    res.status(500).json({ message: err.message })
  }
}
