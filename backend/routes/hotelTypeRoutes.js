const express = require('express');
const router = express.Router();
const {
  getAllHotelTypes,
  getHotelTypeById,
  createHotelType,
  updateHotelType,
  deleteHotelType
} = require('../controllers/hotelTypeController');

// GET all hotel types
router.get('/', getAllHotelTypes);

// GET single hotel type by ID
router.get('/:id', getHotelTypeById);

// POST create new hotel type
router.post('/', createHotelType);

// PUT update hotel type
router.put('/:id', updateHotelType);

// DELETE hotel type
router.delete('/:id', deleteHotelType);

module.exports = router; 