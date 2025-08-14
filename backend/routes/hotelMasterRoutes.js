const express = require('express');
const router = express.Router();
const { 
  getAllHotels, 
  getHotelById, 
  createHotel, 
  updateHotel, 
  deleteHotel,
  toggleHotelBlock
} = require('../controllers/hotelMasterController');

// Get all hotels
router.get('/', getAllHotels);

// Get hotel by ID
router.get('/:id', getHotelById);

// Create new hotel
router.post('/', createHotel);

// Update hotel
router.put('/:id', updateHotel);

// Delete hotel
router.delete('/:id', deleteHotel);

// Toggle hotel block status
router.patch('/:id/toggle-block', toggleHotelBlock);

module.exports = router; 