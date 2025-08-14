const express = require('express');
const router = express.Router();
const {
  getAllFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  getFloorsByHotelId,
  getFloorsForCurrentUser
} = require('../controllers/floorMasterController');

// Import JWT middleware
const { verifyToken } = require('../middleware/auth');

// GET all floors
router.get('/', getAllFloors);

// GET floors for current user's hotel (requires authentication)
router.get('/my-floors', verifyToken, getFloorsForCurrentUser);

// GET single floor by ID
router.get('/:id', getFloorById);

// GET floors by hotel ID
router.get('/hotel/:hotelId', getFloorsByHotelId);

// POST create new floor (requires authentication)
router.post('/', verifyToken, createFloor);

// PUT update floor (requires authentication)
router.put('/:id', verifyToken, updateFloor);

// DELETE floor (requires authentication)
router.delete('/:id', verifyToken, deleteFloor);

module.exports = router; 