const express = require('express');
const router = express.Router();
const roomMasterController = require('../controllers/roomMasterController');
const auth = require('../middleware/auth');

// Public routes (or protected based on your needs)
router.get('/', roomMasterController.getAllRooms);
router.get('/:id', roomMasterController.getRoomById);
router.get('/hotel/:hotelId', roomMasterController.getRoomsByHotelId);
router.get('/block/:blockId', roomMasterController.getRoomsByBlockId);
router.get('/floor/:floorId', roomMasterController.getRoomsByFloorId);
router.get('/status/available', roomMasterController.getAvailableRooms);

// Protected routes
router.post('/', auth, roomMasterController.createRoom);
router.put('/:id', auth, roomMasterController.updateRoom);
router.delete('/:id', auth, roomMasterController.deleteRoom);
router.get('/user/current', auth, roomMasterController.getRoomsForCurrentUser);

module.exports = router;
