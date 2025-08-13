const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAllNationalities,
  getNationalityById,
  createNationality,
  updateNationality,
  deleteNationality
} = require('../controllers/nationalityController');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all nationalities
router.get('/', getAllNationalities);

// Get nationality by ID
router.get('/:id', getNationalityById);

// Create new nationality
router.post('/', createNationality);

// Update nationality
router.put('/:id', updateNationality);

// Delete nationality
router.delete('/:id', deleteNationality);

module.exports = router; 