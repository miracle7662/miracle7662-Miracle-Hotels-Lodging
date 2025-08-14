const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature
} = require('../controllers/featureController');

router.use(verifyToken);

router.get('/', getAllFeatures);
router.get('/:id', getFeatureById);
router.post('/', createFeature);
router.put('/:id', updateFeature);
router.delete('/:id', deleteFeature);

module.exports = router; 