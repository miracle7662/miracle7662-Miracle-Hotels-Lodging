const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAllFragments,
  getFragmentById,
  createFragment,
  updateFragment,
  deleteFragment
} = require('../controllers/fragmentController');

router.use(verifyToken);
router.get('/', getAllFragments);
router.get('/:id', getFragmentById);
router.post('/', createFragment);
router.put('/:id', updateFragment);
router.delete('/:id', deleteFragment);

module.exports = router; 