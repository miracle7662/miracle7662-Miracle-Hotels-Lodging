const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAllNewspapers,
  getNewspaperById,
  createNewspaper,
  updateNewspaper,
  deleteNewspaper
} = require('../controllers/newspaperController');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all newspapers
router.get('/', getAllNewspapers);

// Get newspaper by ID
router.get('/:id', getNewspaperById);

// Create new newspaper
router.post('/', createNewspaper);

// Update newspaper
router.put('/:id', updateNewspaper);

// Delete newspaper
router.delete('/:id', deleteNewspaper);

module.exports = router; 