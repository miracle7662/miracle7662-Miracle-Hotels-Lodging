const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHotelId,
  getRoomsForCurrentUser,
} = require('../controllers/roomMasterController');
const { verifyToken } = require('../middleware/auth');

// Validate ID parameters
const validateId = (req, res, next) => {
  const id = req.params.id || req.params.hotelId;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  next();
};

// GET all rooms (authenticated)
router.get('/', verifyToken, getAllRooms);

// GET rooms for current user's hotel (authenticated)
router.get('/my-rooms', verifyToken, getRoomsForCurrentUser);

// GET single room by ID (authenticated)
router.get('/:id', verifyToken, validateId, getRoomById);

// GET rooms by hotel ID (authenticated)
router.get('/hotel/:hotelId', verifyToken, validateId, getRoomsByHotelId);

// POST create new room (authenticated)
router.post('/', verifyToken, createRoom);

// PUT update room (authenticated)
router.put('/:id', verifyToken, validateId, updateRoom);

// DELETE room (soft delete, authenticated)
router.delete('/:id', verifyToken, validateId, deleteRoom);

module.exports = router;