const { db } = require('../config/database');

// Get all features
const getAllFeatures = (req, res) => {
  try {
    const { hotelid } = req.query;
    const { role, id: userId } = req.user;

    let query = `
      SELECT f.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstfeaturemaster f
      LEFT JOIN mstldg_hotelmasters h ON f.hotelid = h.ldg_hotelid
      WHERE f.status = 1
    `;
    let params = [];

    // Filter by hotel for hotel users
    if (role === 'hotel' || role === 'user') {
      query += ' AND f.hotelid = ?';
      params.push(userId);
    } else if (hotelid) {
      query += ' AND f.hotelid = ?';
      params.push(hotelid);
    }

    query += ' ORDER BY f.feature_name ASC';

    const features = db.prepare(query).all(params);

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error getting features:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting features',
      error: error.message
    });
  }
};

// Get feature by ID
const getFeatureById = (req, res) => {
  try {
    const { id } = req.params;
    const feature = db.prepare(`
      SELECT f.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstfeaturemaster f
      LEFT JOIN mstldg_hotelmasters h ON f.hotelid = h.ldg_hotelid
      WHERE f.featureid = ?
    `).get(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    res.json({
      success: true,
      data: feature
    });
  } catch (error) {
    console.error('Error getting feature:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting feature',
      error: error.message
    });
  }
};

// Create new feature
const createFeature = async (req, res) => {
  try {
    console.log('🔍 createFeature - Request received');
    console.log('🔍 createFeature - Request body:', req.body);
    console.log('🔍 createFeature - User from token:', req.user);
    
    const { feature_name, feature_Description, hotelid, status = 1 } = req.body;
    
    if (!feature_name || !feature_Description) {
      return res.status(400).json({ error: 'Feature name and description are required' });
    }

    // Determine hotelid based on user role
    let finalHotelId = hotelid;
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      finalHotelId = req.user.id;
      console.log('🔍 createFeature - Using user ID as hotelid:', finalHotelId);
    }

    // Ensure mstldg_hotelmasters entry exists for hotel users
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      const hotelExists = db.prepare('SELECT * FROM mstldg_hotelmasters WHERE ldg_hotelid = ?').get(finalHotelId);
      if (!hotelExists) {
        console.log('🔍 createFeature - Creating mstldg_hotelmasters entry for hotel user');
        db.prepare(`
          INSERT INTO mstldg_hotelmasters (ldg_hotelid, hotel_name, status, created_date)
          VALUES (?, ?, 1, datetime('now'))
        `).run(finalHotelId, req.user.name || 'Hotel User');
      }
    }

    const result = db.prepare(`
      INSERT INTO ldg_mstfeaturemaster (feature_name, feature_Description, status, hotelid, created_by_id, created_date)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run(feature_name, feature_Description, status, finalHotelId, req.user.id);

    console.log('🔍 createFeature - Database insert result:', result);

    const newFeature = db.prepare(`
      SELECT f.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstfeaturemaster f
      LEFT JOIN mstldg_hotelmasters h ON f.hotelid = h.ldg_hotelid
      WHERE f.featureid = ?
    `).get(result.lastInsertRowid);

    console.log('🔍 createFeature - Created feature:', newFeature);

    res.status(201).json({
      message: 'Feature created successfully',
      data: newFeature
    });
  } catch (error) {
    console.error('🔍 createFeature - Error:', error);
    res.status(500).json({ error: 'Error creating feature' });
  }
};

// Update feature
const updateFeature = (req, res) => {
  try {
    const { id } = req.params;
    const { feature_name, feature_Description, status } = req.body;
    const { id: userId } = req.user;

    if (!feature_name || !feature_Description) {
      return res.status(400).json({
        success: false,
        message: 'Feature name and description are required'
      });
    }

    const result = db.prepare(`
      UPDATE ldg_mstfeaturemaster 
      SET feature_name = ?, feature_Description = ?, status = ?, updated_by_id = ?, updated_date = datetime('now')
      WHERE featureid = ?
    `).run(feature_name, feature_Description, status, userId, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    res.json({
      success: true,
      message: 'Feature updated successfully'
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feature',
      error: error.message
    });
  }
};

// Delete feature
const deleteFeature = (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM ldg_mstfeaturemaster WHERE featureid = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    res.json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feature',
      error: error.message
    });
  }
};

module.exports = {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature
}; 