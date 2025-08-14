const { db } = require('../config/database');

// Get all guest types (filtered by hotel for hotel users)
const getAllGuestTypes = (req, res) => {
  try {
    const { hotelid } = req.query;
    const { role, id: userId } = req.user; // From auth middleware

    // First, let's check if the table exists and has any data
    try {
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ldg_mstguesttype'").get();
      console.log('Table check:', tableCheck);
      
      if (tableCheck) {
        const countQuery = db.prepare("SELECT COUNT(*) as count FROM ldg_mstguesttype").get();
        console.log('Total guest types in database:', countQuery.count);
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
        SELECT gt.*, COALESCE(h.hotel_name, 'Unknown Hotel') as ldg_hotel_name
        FROM ldg_mstguesttype gt
        LEFT JOIN mstldg_hotelmasters h ON gt.hotelid = h.ldg_hotelid
        WHERE gt.status = 1
      `;
    } else {
      query = `
        SELECT gt.*, 'Unknown Hotel' as ldg_hotel_name
        FROM ldg_mstguesttype gt
        WHERE gt.status = 1
      `;
    }
    
    const params = [];

    // If hotel user, filter by their hotel
    if (role === 'hotel' || role === 'user') {
      query += ` AND gt.hotelid = ?`;
      params.push(hotelid || userId);
    }

    query += ` ORDER BY gt.guest_type ASC`;

    console.log('Executing query:', query);
    console.log('With params:', params);

    const guestTypes = db.prepare(query).all(...params);
    
    console.log('Found guest types:', guestTypes);
    
    res.json({
      success: true,
      data: guestTypes,
      message: 'Guest types retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting guest types:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving guest types',
      error: error.message
    });
  }
};

// Get guest type by ID
const getGuestTypeById = (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    let query = `
      SELECT gt.*
      FROM ldg_mstguesttype gt
      WHERE gt.guesttypeid = ? AND gt.status = 1
    `;
    
    const params = [id];

    // If hotel user, ensure they can only access their hotel's data
    if (role === 'hotel' || role === 'user') {
      query += ` AND gt.hotelid = ?`;
      params.push(userId);
    }

    const guestType = db.prepare(query).get(...params);

    if (!guestType) {
      return res.status(404).json({
        success: false,
        message: 'Guest type not found'
      });
    }

    res.json({
      success: true,
      data: guestType,
      message: 'Guest type retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting guest type:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving guest type',
      error: error.message
    });
  }
};

// Create new guest type
const createGuestType = (req, res) => {
  try {
    const { guest_type, status = 1, hotelid: selectedHotelId } = req.body;
    const { role, id: userId } = req.user;

    if (!guest_type) {
      return res.status(400).json({
        success: false,
        message: 'Guest type is required'
      });
    }

    // Determine hotelid based on user role
    let hotelid = null;
    if (role === 'hotel' || role === 'user') {
      // For hotel users, get their hotel ID from the hotels table
      try {
        const hotelQuery = db.prepare('SELECT id FROM hotels WHERE id = ?').get(userId);
        if (hotelQuery) {
          // Check if this hotel exists in mstldg_hotelmasters
          const hotelMasterQuery = db.prepare('SELECT ldg_hotelid FROM mstldg_hotelmasters WHERE ldg_hotelid = ?').get(userId);
          if (hotelMasterQuery) {
            hotelid = userId;
          } else {
            // If hotel doesn't exist in mstldg_hotelmasters, create it
            const hotelNameQuery = db.prepare('SELECT hotel_name FROM hotels WHERE id = ?').get(userId);
            if (hotelNameQuery) {
              db.prepare('INSERT INTO mstldg_hotelmasters (ldg_hotelid, hotel_name, status) VALUES (?, ?, 1)').run(userId, hotelNameQuery.hotel_name);
              hotelid = userId;
            }
          }
        }
      } catch (error) {
        console.error('Error getting hotel info:', error);
      }
    } else if (selectedHotelId) {
      // For admin users, use the selected hotel ID
      hotelid = selectedHotelId;
    }

    // If no hotel ID found, use the user ID as fallback
    if (!hotelid) {
      hotelid = userId;
    }

    const insertQuery = `
      INSERT INTO ldg_mstguesttype (guest_type, created_by_id, hotelid, status)
      VALUES (?, ?, ?, ?)
    `;

    const result = db.prepare(insertQuery).run(guest_type, userId, hotelid, status);

    res.status(201).json({
      success: true,
      data: {
        guesttypeid: result.lastInsertRowid,
        guest_type,
        hotelid,
        status
      },
      message: 'Guest type created successfully'
    });
  } catch (error) {
    console.error('Error creating guest type:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating guest type',
      error: error.message
    });
  }
};

// Update guest type
const updateGuestType = (req, res) => {
  try {
    const { id } = req.params;
    const { guest_type, status } = req.body;
    const { role, id: userId } = req.user;

    if (!guest_type) {
      return res.status(400).json({
        success: false,
        message: 'Guest type is required'
      });
    }

    // Check if guest type exists and user has permission
    let checkQuery = `
      SELECT * FROM ldg_mstguesttype 
      WHERE guesttypeid = ? AND status = 1
    `;
    
    const params = [id];

    if (role === 'hotel' || role === 'user') {
      checkQuery += ` AND hotelid = ?`;
      params.push(userId);
    }

    const existingGuestType = db.prepare(checkQuery).get(...params);

    if (!existingGuestType) {
      return res.status(404).json({
        success: false,
        message: 'Guest type not found or access denied'
      });
    }

    const updateQuery = `
      UPDATE ldg_mstguesttype 
      SET guest_type = ?, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP
      ${status !== undefined ? ', status = ?' : ''}
      WHERE guesttypeid = ?
    `;

    const updateParams = [guest_type, userId];
    if (status !== undefined) {
      updateParams.push(status);
    }
    updateParams.push(id);

    db.prepare(updateQuery).run(...updateParams);

    res.json({
      success: true,
      message: 'Guest type updated successfully'
    });
  } catch (error) {
    console.error('Error updating guest type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating guest type',
      error: error.message
    });
  }
};

// Delete guest type (soft delete)
const deleteGuestType = (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    // Check if guest type exists and user has permission
    let checkQuery = `
      SELECT * FROM ldg_mstguesttype 
      WHERE guesttypeid = ? AND status = 1
    `;
    
    const params = [id];

    if (role === 'hotel' || role === 'user') {
      checkQuery += ` AND hotelid = ?`;
      params.push(userId);
    }

    const existingGuestType = db.prepare(checkQuery).get(...params);

    if (!existingGuestType) {
      return res.status(404).json({
        success: false,
        message: 'Guest type not found or access denied'
      });
    }

    const deleteQuery = `
      UPDATE ldg_mstguesttype 
      SET status = 0, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP
      WHERE guesttypeid = ?
    `;

    db.prepare(deleteQuery).run(userId, id);

    res.json({
      success: true,
      message: 'Guest type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting guest type:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting guest type',
      error: error.message
    });
  }
};

module.exports = {
  getAllGuestTypes,
  getGuestTypeById,
  createGuestType,
  updateGuestType,
  deleteGuestType
}; 