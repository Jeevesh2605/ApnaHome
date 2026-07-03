import express from 'express'
import {
  createListing, getListings, getListing,
  updateListing, markFilled, deleteListing, getOwnerListings
} from '../controllers/listing.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyRole } from '../middleware/verifyRole.js'

const router = express.Router()

router.get('/mine', verifyToken, verifyRole('owner'), getOwnerListings)     // owner's own listings

router.get('/', verifyToken, getListings)                              // tenant browses
router.get('/:id', verifyToken, getListing)
router.post('/', verifyToken, verifyRole('owner'), createListing)
router.put('/:id', verifyToken, verifyRole('owner'), updateListing)
router.patch('/:id/fill', verifyToken, verifyRole('owner'), markFilled)
router.delete('/:id', verifyToken, verifyRole('owner'), deleteListing)

export default router
