const { db } = require('../config/database');

// Get all fragments
const getAllFragments = (req, res) => {
  try {
    const { hotelid } = req.query;
    const { role, id: userId } = req.user;

    let query = `
      SELECT f.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstfragmentmaster f
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

    query += ' ORDER BY f.fragment_name ASC';

    const fragments = db.prepare(query).all(params);

    res.json({
      success: true,
      data: fragments
    });
  } catch (error) {
    console.error('Error getting fragments:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting fragments',
      error: error.message
    });
  }
};

// Get fragment by ID
const getFragmentById = (req, res) => {
  try {
    const { id } = req.params;
    const fragment = db.prepare(`
      SELECT f.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstfragmentmaster f
      LEFT JOIN mstldg_hotelmasters h ON f.hotelid = h.ldg_hotelid
      WHERE f.fragmentid = ?
    `).get(id);

    if (!fragment) {
      return res.status(404).json({
        success: false,
        message: 'Fragment not found'
      });
    }

    res.json({
      success: true,
      data: fragment
    });
  } catch (error) {
    console.error('Error getting fragment:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting fragment',
      error: error.message
    });
  }
};

// Create new fragment
const createFragment = async (req, res) => {
  try {
    console.log('🔍 createFragment - Request received');
    console.log('🔍 createFragment - Request body:', req.body);
    console.log('🔍 createFragment - User from token:', req.user);
    
    const { fragment_name, hotelid, status = 1 } = req.body;
    
    if (!fragment_name) {
      return res.status(400).json({ error: 'Fragment name is required' });
    }

    // Determine hotelid based on user role
    let finalHotelId = hotelid;
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      finalHotelId = req.user.id;
      console.log('🔍 createFragment - Using user ID as hotelid:', finalHotelId);
    }

    // Ensure mstldg_hotelmasters entry exists for hotel users
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      const hotelExists = db.prepare('SELECT * FROM mstldg_hotelmasters WHERE ldg_hotelid = ?').get(finalHotelId);
      if (!hotelExists) {
        console.log('🔍 createFragment - Creating mstldg_hotelmasters entry for hotel user');
        db.prepare(`
          INSERT INTO mstldg_hotelmasters (ldg_hotelid, hotel_name, status, created_date)
          VALUES (?, ?, 1, datetime('now'))
        `).run(finalHotelId, req.user.name || 'Hotel User');
      }
    }

    const result = db.prepare(`
      INSERT INTO ldg_mstfragmentmaster (fragment_name, status, hotelid, created_by_id, created_date)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(fragment_name, status, finalHotelId, req.user.id);

    console.log('🔍 createFragment - Database insert result:', result);

    const newFragment = db.prepare(`
      SELECT f.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstfragmentmaster f
      LEFT JOIN mstldg_hotelmasters h ON f.hotelid = h.ldg_hotelid
      WHERE f.fragmentid = ?
    `).get(result.lastInsertRowid);

    console.log('🔍 createFragment - Created fragment:', newFragment);

    res.status(201).json({
      message: 'Fragment created successfully',
      data: newFragment
    });
  } catch (error) {
    console.error('🔍 createFragment - Error:', error);
    res.status(500).json({ error: 'Error creating fragment' });
  }
};

// Update fragment
const updateFragment = (req, res) => {
  try {
    const { id } = req.params;
    const { fragment_name, status } = req.body;

    if (!fragment_name) {
      return res.status(400).json({ error: 'Fragment name is required' });
    }

    const result = db.prepare(`
      UPDATE ldg_mstfragmentmaster 
      SET fragment_name = ?, status = ?, updated_by_id = ?, updated_date = datetime('now')
      WHERE fragmentid = ?
    `).run(fragment_name, status, req.user.id, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fragment not found'
      });
    }

    const updatedFragment = db.prepare(`
      SELECT f.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstfragmentmaster f
      LEFT JOIN mstldg_hotelmasters h ON f.hotelid = h.ldg_hotelid
      WHERE f.fragmentid = ?
    `).get(id);

    res.json({
      success: true,
      message: 'Fragment updated successfully',
      data: updatedFragment
    });
  } catch (error) {
    console.error('Error updating fragment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fragment',
      error: error.message
    });
  }
};

// Delete fragment
const deleteFragment = (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM ldg_mstfragmentmaster WHERE fragmentid = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fragment not found'
      });
    }

    res.json({
      success: true,
      message: 'Fragment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fragment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fragment',
      error: error.message
    });
  }
};

module.exports = {
  getAllFragments,
  getFragmentById,
  createFragment,
  updateFragment,
  deleteFragment
}; 