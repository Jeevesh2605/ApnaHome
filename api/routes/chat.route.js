import express from 'express'
import { getChatHistory, markAsRead } from '../controllers/chat.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'

const router = express.Router()

router.get('/:interestId', verifyToken, getChatHistory)
router.patch('/:interestId/read', verifyToken, markAsRead)

export default router
