const { db } = require('../config/database');

// Get all nationalities (filtered by hotel for hotel users)
const getAllNationalities = (req, res) => {
  try {
    const { hotelid } = req.query;
    const { role, id: userId } = req.user; // From auth middleware

    // First, let's check if the table exists and has any data
    try {
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ldg_mstnationalitymaster'").get();
      console.log('Table check:', tableCheck);
      
      if (tableCheck) {
        const countQuery = db.prepare("SELECT COUNT(*) as count FROM ldg_mstnationalitymaster").get();
        console.log('Total nationalities in database:', countQuery.count);
      }
    } catch (tableError) {
      console.error('Table check error:', tableError);
    }

    // Check if hotel table exists
    let hasHotelTable = false;
    try {
      const hotelTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='mstldg_hotelmasters'").get();
      hasHotelTable = !!hotelTableCheck;
      console.log('Hotel table exists:', hasHotelTable);
    } catch (hotelTableError) {
      console.error('Hotel table check error:', hotelTableError);
    }

    let query;
    if (hasHotelTable) {
      query = `
        SELECT n.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
        FROM ldg_mstnationalitymaster n
        LEFT JOIN mstldg_hotelmasters h ON n.hotelid = h.ldg_hotelid
        WHERE n.status = 1
      `;
    } else {
      query = `
        SELECT n.*, 'Unknown Hotel' as ldg_hotel_name
        FROM ldg_mstnationalitymaster n
        WHERE n.status = 1
      `;
    }
    
    const params = [];

    // If hotel user, filter by their hotel
    if (role === 'hotel' || role === 'user') {
      query += ` AND n.hotelid = ?`;
      params.push(hotelid || userId);
    }

    query += ` ORDER BY n.nationality ASC`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const nationalities = db.prepare(query).all(...params);
    
    console.log('Found nationalities:', nationalities);
    
    res.json({
      success: true,
      data: nationalities,
      message: 'Nationalities retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting nationalities:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving nationalities',
      error: error.message
    });
  }
};

// Get nationality by ID
const getNationalityById = (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    let query = `
      SELECT n.*
      FROM ldg_mstnationalitymaster n
      WHERE n.nationalityid = ? AND n.status = 1
    `;
    
    const params = [id];

    // If hotel user, ensure they can only access their hotel's data
    if (role === 'hotel' || role === 'user') {
      query += ` AND n.hotelid = ?`;
      params.push(userId);
    }

    const nationality = db.prepare(query).get(...params);

    if (!nationality) {
      return res.status(404).json({
        success: false,
        message: 'Nationality not found'
      });
    }

    res.json({
      success: true,
      data: nationality,
      message: 'Nationality retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting nationality:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving nationality',
      error: error.message
    });
  }
};

// Create new nationality
const createNationality = async (req, res) => {
  try {
    console.log('🔍 createNationality - Request received');
    console.log('🔍 createNationality - Request body:', req.body);
    console.log('🔍 createNationality - User from token:', req.user);
    
    const { nationality, hotelid, status = 1 } = req.body;
    
    if (!nationality) {
      return res.status(400).json({ error: 'Nationality is required' });
    }

    // Determine hotelid based on user role
    let finalHotelId = hotelid;
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      finalHotelId = req.user.id;
      console.log('🔍 createNationality - Using user ID as hotelid:', finalHotelId);
    }

    // Ensure mstldg_hotelmasters entry exists for hotel users
    if (req.user.role === 'hotel' || req.user.role === 'user') {
      const hotelExists = db.prepare('SELECT * FROM mstldg_hotelmasters WHERE ldg_hotelid = ?').get(finalHotelId);
      if (!hotelExists) {
        console.log('🔍 createNationality - Creating mstldg_hotelmasters entry for hotel user');
        db.prepare(`
          INSERT INTO mstldg_hotelmasters (ldg_hotelid, hotel_name, status, created_date)
          VALUES (?, ?, 1, datetime('now'))
        `).run(finalHotelId, req.user.name || 'Hotel User');
      }
    }

    const result = db.prepare(`
      INSERT INTO ldg_mstnationalitymaster (nationality, status, hotelid, Created_by_id, created_date)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(nationality, status, finalHotelId, req.user.id);

    console.log('🔍 createNationality - Database insert result:', result);

    const newNationality = db.prepare(`
      SELECT n.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
      FROM ldg_mstnationalitymaster n
      LEFT JOIN mstldg_hotelmasters h ON n.hotelid = h.ldg_hotelid
      WHERE n.nationalityid = ?
    `).get(result.lastInsertRowid);

    console.log('🔍 createNationality - Created nationality:', newNationality);

    res.status(201).json({
      message: 'Nationality created successfully',
      data: newNationality
    });
  } catch (error) {
    console.error('🔍 createNationality - Error:', error);
    res.status(500).json({ error: 'Error creating nationality' });
  }
};

// Update nationality
const updateNationality = (req, res) => {
  try {
    const { id } = req.params;
    const { nationality, status } = req.body;
    const { role, id: userId } = req.user;

    if (!nationality) {
      return res.status(400).json({
        success: false,
        message: 'Nationality is required'
      });
    }

    // Check if nationality exists and user has permission
    let checkQuery = `
      SELECT * FROM ldg_mstnationalitymaster 
      WHERE nationalityid = ? AND status = 1
    `;
    
    const params = [id];

    if (role === 'hotel' || role === 'user') {
      checkQuery += ` AND hotelid = ?`;
      params.push(userId);
    }

    const existingNationality = db.prepare(checkQuery).get(...params);

    if (!existingNationality) {
      return res.status(404).json({
        success: false,
        message: 'Nationality not found or access denied'
      });
    }

    const updateQuery = `
      UPDATE ldg_mstnationalitymaster 
      SET nationality = ?, Updated_by_id = ?, Updated_date = CURRENT_TIMESTAMP
      ${status !== undefined ? ', status = ?' : ''}
      WHERE nationalityid = ?
    `;

    const updateParams = [nationality, userId];
    if (status !== undefined) {
      updateParams.push(status);
    }
    updateParams.push(id);

    db.prepare(updateQuery).run(...updateParams);

    res.json({
      success: true,
      message: 'Nationality updated successfully'
    });
  } catch (error) {
    console.error('Error updating nationality:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating nationality',
      error: error.message
    });
  }
};

// Delete nationality (soft delete)
const deleteNationality = (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    // Check if nationality exists and user has permission
    let checkQuery = `
      SELECT * FROM ldg_mstnationalitymaster 
      WHERE nationalityid = ? AND status = 1
    `;
    
    const params = [id];

    if (role === 'hotel' || role === 'user') {
      checkQuery += ` AND hotelid = ?`;
      params.push(userId);
    }

    const existingNationality = db.prepare(checkQuery).get(...params);

    if (!existingNationality) {
      return res.status(404).json({
        success: false,
        message: 'Nationality not found or access denied'
      });
    }

    const deleteQuery = `
      UPDATE ldg_mstnationalitymaster 
      SET status = 0, Updated_by_id = ?, Updated_date = CURRENT_TIMESTAMP
      WHERE nationalityid = ?
    `;

    db.prepare(deleteQuery).run(userId, id);

    res.json({
      success: true,
      message: 'Nationality deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting nationality:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting nationality',
      error: error.message
    });
  }
};

module.exports = {
  getAllNationalities,
  getNationalityById,
  createNationality,
  updateNationality,
  deleteNationality
}; 