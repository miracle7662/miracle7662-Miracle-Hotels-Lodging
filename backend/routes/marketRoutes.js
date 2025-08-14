const express = require('express');
const router = express.Router();
const {
  getAllMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket
} = require('../controllers/marketController');

// GET all markets
router.get('/', getAllMarkets);

// GET single market by ID
router.get('/:id', getMarketById);

// POST create new market
router.post('/', createMarket);

// PUT update market
router.put('/:id', updateMarket);

// DELETE market
router.delete('/:id', deleteMarket);

module.exports = router; 