import express from 'express'
import { register, login, googleAuth } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/google', googleAuth)   // receives Firebase idToken from frontend

export default router
