import express from 'express'
import { upsertProfile, getProfile } from '../controllers/tenant.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'

const router = express.Router()

router.post('/profile', verifyToken, verifyRole('tenant'), upsertProfile)
router.get('/profile', verifyToken, verifyRole('tenant'), getProfile)

export default router
