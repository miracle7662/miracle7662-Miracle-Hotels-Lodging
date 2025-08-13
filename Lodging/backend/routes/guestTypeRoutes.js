const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAllGuestTypes,
  getGuestTypeById,
  createGuestType,
  updateGuestType,
  deleteGuestType
} = require('../controllers/guestTypeController');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all guest types
router.get('/', getAllGuestTypes);

// Get guest type by ID
router.get('/:id', getGuestTypeById);

// Create new guest type
router.post('/', createGuestType);

// Update guest type
router.put('/:id', updateGuestType);

// Delete guest type
router.delete('/:id', deleteGuestType);

module.exports = router; 