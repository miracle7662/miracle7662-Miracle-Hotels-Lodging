const express = require('express');
const router = express.Router();
const {
  getAllBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
  getBlocksByHotelId,
  getBlocksForCurrentUser
} = require('../controllers/blockMasterController');

// Import JWT middleware
const { verifyToken } = require('../middleware/auth');

// GET all blocks
router.get('/', getAllBlocks);

// GET blocks for current user's hotel (requires authentication)
router.get('/my-blocks', verifyToken, getBlocksForCurrentUser);

// GET single block by ID
router.get('/:id', getBlockById);

// GET blocks by hotel ID
router.get('/hotel/:hotelId', getBlocksByHotelId);

// POST create new block (requires authentication)
router.post('/', verifyToken, createBlock);

// PUT update block (requires authentication)
router.put('/:id', verifyToken, updateBlock);

// DELETE block (requires authentication)
router.delete('/:id', verifyToken, deleteBlock);

module.exports = router; 