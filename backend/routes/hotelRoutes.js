const express = require('express');
const router = express.Router();
const {
  login,
  getAllHotels,
  getHotelByUserId,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');

// Public routes
router.post('/login', login);

// Protected routes (you can add middleware here later)
router.get('/', getAllHotels);
router.get('/user/:userId', getHotelByUserId);
router.get('/:id', getHotelById);
router.post('/', createHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);

module.exports = router; 