import express from 'express'
import {
  sendInterest, respondToInterest, getOwnerInterests, getTenantInterests
} from '../controllers/interest.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'

const router = express.Router()

router.post('/', verifyToken, verifyRole('tenant'), sendInterest)
router.patch('/:id', verifyToken, verifyRole('owner'), respondToInterest)
router.get('/incoming', verifyToken, verifyRole('owner'), getOwnerInterests)
router.get('/sent', verifyToken, verifyRole('tenant'), getTenantInterests)

export default router
