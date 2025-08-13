const express = require('express');
const router = express.Router();
const {
  getAllCities,
  getCityById,
  getCitiesByState,
  getCitiesByStateAndDistrict,
  createCity,
  updateCity,
  deleteCity
} = require('../controllers/cityMasterController');

// Get all cities
router.get('/', getAllCities);

// Get cities by state id
router.get('/by-state/:stateId', getCitiesByState);

// Get cities by state and district
router.get('/by-state/:stateId/district/:districtId', getCitiesByStateAndDistrict);

// Get city by ID
router.get('/:id', getCityById);

// Create new city
router.post('/', createCity);

// Update city
router.put('/:id', updateCity);

// Delete city
router.delete('/:id', deleteCity);

module.exports = router;
