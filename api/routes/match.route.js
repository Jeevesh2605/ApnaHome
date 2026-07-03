import express from 'express'
import { getScore, getTenantMatches } from '../controllers/match.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'

const router = express.Router()

router.get('/:listingId', verifyToken, verifyRole('tenant'), getScore)
router.get('/', verifyToken, verifyRole('tenant'), getTenantMatches)

export default router
