const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest
} = require('../controllers/guestMasterController');
const { upload } = require('../middleware/upload');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all guests
router.get('/', getAllGuests);

// GET guest by ID
router.get('/:id', getGuestById);

// POST create new guest (with optional file uploads)
router.post(
  '/',
  upload.fields([
    { name: 'adhar_no', maxCount: 1 },
    { name: 'adhar_front', maxCount: 1 },
    { name: 'adhar_back', maxCount: 1 },
    { name: 'pan_no', maxCount: 1 },
    { name: 'driving_license', maxCount: 1 },
    { name: 'Other', maxCount: 1 },
  ]),
  createGuest
);

// PUT update guest (with optional file uploads)
router.put(
  '/:id',
  upload.fields([
    { name: 'adhar_no', maxCount: 1 },
    { name: 'adhar_front', maxCount: 1 },
    { name: 'adhar_back', maxCount: 1 },
    { name: 'pan_no', maxCount: 1 },
    { name: 'driving_license', maxCount: 1 },
    { name: 'Other', maxCount: 1 },
  ]),
  updateGuest
);

// DELETE guest
router.delete('/:id', deleteGuest);

module.exports = router;
