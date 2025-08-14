const { db } = require('../config/database');

// Get all newspapers
const getAllNewspapers = (req, res) => {
  try {
    const { hotelid } = req.query;
    const { role, id: userId } = req.user;

    let query = `
      SELECT n.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstnewspapermaster n
      LEFT JOIN mstldg_hotelmasters h ON n.hotelid = h.ldg_hotelid
      WHERE n.status = 1
    `;
    let params = [];

    // Filter by hotel for hotel users
    if (role === 'hotel' || role === 'user') {
      query += ' AND n.hotelid = ?';
      params.push(userId);
    } else if (hotelid) {
      query += ' AND n.hotelid = ?';
      params.push(hotelid);
    }

    query += ' ORDER BY n.paper_name ASC';

    const newspapers = db.prepare(query).all(params);

    res.json({
      success: true,
      data: newspapers
    });
  } catch (error) {
    console.error('Error getting newspapers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting newspapers',
      error: error.message
    });
  }
};

// Get newspaper by ID
const getNewspaperById = (req, res) => {
  try {
    const { id } = req.params;
    const newspaper = db.prepare(`
      SELECT n.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstnewspapermaster n
      LEFT JOIN mstldg_hotelmasters h ON n.hotelid = h.ldg_hotelid
      WHERE n.newsid = ?
    `).get(id);

    if (!newspaper) {
      return res.status(404).json({
        success: false,
        message: 'Newspaper not found'
      });
    }

    res.json({
      success: true,
      data: newspaper
    });
  } catch (error) {
    console.error('Error getting newspaper:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting newspaper',
      error: error.message
    });
  }
};

// Create new newspaper
const createNewspaper = async (req, res) => {
  try {
    console.log('🔍 createNewspaper - Request received');
    console.log('🔍 createNewspaper - Request body:', req.body);
    console.log('🔍 createNewspaper - User from token:', req.user);
    
    const { paper_name, hotelid, status = 1 } = req.body;
    
    if (!paper_name) {
      return res.status(400).json({ error: 'Paper name is required' });
    }

    // Determine hotelid based on user role
    let finalHotelId = hotelid;
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      finalHotelId = req.user.id;
      console.log('🔍 createNewspaper - Using user ID as hotelid:', finalHotelId);
    }

    // Ensure mstldg_hotelmasters entry exists for hotel users
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      const hotelExists = db.prepare('SELECT * FROM mstldg_hotelmasters WHERE ldg_hotelid = ?').get(finalHotelId);
      if (!hotelExists) {
        console.log('🔍 createNewspaper - Creating mstldg_hotelmasters entry for hotel user');
        db.prepare(`
          INSERT INTO mstldg_hotelmasters (ldg_hotelid, hotel_name, status, created_date)
          VALUES (?, ?, 1, datetime('now'))
        `).run(finalHotelId, req.user.name || 'Hotel User');
      }
    }

    const result = db.prepare(`
      INSERT INTO ldg_mstnewspapermaster (paper_name, status, hotelid, created_by_id, created_date)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(paper_name, status, finalHotelId, req.user.id);

    console.log('🔍 createNewspaper - Database insert result:', result);

    const newNewspaper = db.prepare(`
      SELECT n.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstnewspapermaster n
      LEFT JOIN mstldg_hotelmasters h ON n.hotelid = h.ldg_hotelid
      WHERE n.newsid = ?
    `).get(result.lastInsertRowid);

    console.log('🔍 createNewspaper - Created newspaper:', newNewspaper);

    res.status(201).json({
      message: 'Newspaper created successfully',
      data: newNewspaper
    });
  } catch (error) {
    console.error('🔍 createNewspaper - Error:', error);
    res.status(500).json({ error: 'Error creating newspaper' });
  }
};

// Update newspaper
const updateNewspaper = (req, res) => {
  try {
    const { id } = req.params;
    const { paper_name, status } = req.body;
    const { id: userId } = req.user;

    if (!paper_name) {
      return res.status(400).json({
        success: false,
        message: 'Paper name is required'
      });
    }

    const result = db.prepare(`
      UPDATE ldg_mstnewspapermaster 
      SET paper_name = ?, status = ?, updated_by_id = ?, updated_date = datetime('now')
      WHERE newsid = ?
    `).run(paper_name, status, userId, id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Newspaper not found'
      });
    }

    res.json({
      success: true,
      message: 'Newspaper updated successfully'
    });
  } catch (error) {
    console.error('Error updating newspaper:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating newspaper',
      error: error.message
    });
  }
};

// Delete newspaper
const deleteNewspaper = (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM ldg_mstnewspapermaster WHERE newsid = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Newspaper not found'
      });
    }

    res.json({
      success: true,
      message: 'Newspaper deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting newspaper:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting newspaper',
      error: error.message
    });
  }
};

module.exports = {
  getAllNewspapers,
  getNewspaperById,
  createNewspaper,
  updateNewspaper,
  deleteNewspaper
}; 