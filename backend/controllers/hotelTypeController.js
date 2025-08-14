const { db } = require('../config/database');

// Get all hotel types
const getAllHotelTypes = (req, res) => {
  try {
    const hotelTypes = db.prepare(`
      SELECT * FROM ldg_mstlodgehoteltype 
      WHERE ldg_status = 1 
      ORDER BY ldg_hotel_type
    `).all();
    res.json(hotelTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel types', details: error.message });
  }
};

// Get single hotel type by ID
const getHotelTypeById = (req, res) => {
  try {
    const hotelType = db.prepare(`
      SELECT * FROM ldg_mstlodgehoteltype 
      WHERE ldg_hoteltypeid = ? AND ldg_status = 1
    `).get(req.params.id);
    
    if (hotelType) {
      res.json(hotelType);
    } else {
      res.status(404).json({ error: 'Hotel type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel type', details: error.message });
  }
};

// Create new hotel type
const createHotelType = (req, res) => {
  const { ldg_hotel_type, ldg_hotelid, ldg_marketid } = req.body;
  
  if (!ldg_hotel_type) {
    return res.status(400).json({ error: 'Hotel type name is required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO ldg_mstlodgehoteltype (ldg_hotel_type, ldg_hotelid, ldg_marketid) 
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(ldg_hotel_type, ldg_hotelid, ldg_marketid);
    
    // Get the newly created hotel type
    const newHotelType = db.prepare(`
      SELECT * FROM ldg_mstlodgehoteltype WHERE ldg_hoteltypeid = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Hotel type created successfully!',
      hotelType: newHotelType
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hotel type', details: error.message });
  }
};

// Update hotel type
const updateHotelType = (req, res) => {
  const { ldg_hotel_type, ldg_hotelid, ldg_marketid } = req.body;
  const { id } = req.params;

  if (!ldg_hotel_type) {
    return res.status(400).json({ error: 'Hotel type name is required' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstlodgehoteltype 
      SET ldg_hotel_type = ?, ldg_hotelid = ?, ldg_marketid = ?, 
          ldg_updated_date = CURRENT_TIMESTAMP 
      WHERE ldg_hoteltypeid = ?
    `);
    const result = stmt.run(ldg_hotel_type, ldg_hotelid, ldg_marketid, id);
    
    if (result.changes > 0) {
      res.json({ message: 'Hotel type updated successfully!' });
    } else {
      res.status(404).json({ error: 'Hotel type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hotel type', details: error.message });
  }
};

// Delete hotel type (soft delete)
const deleteHotelType = (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstlodgehoteltype 
      SET ldg_status = 0, ldg_updated_date = CURRENT_TIMESTAMP 
      WHERE ldg_hoteltypeid = ?
    `);
    const result = stmt.run(req.params.id);
    
    if (result.changes > 0) {
      res.json({ message: 'Hotel type deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Hotel type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hotel type', details: error.message });
  }
};

module.exports = {
  getAllHotelTypes,
  getHotelTypeById,
  createHotelType,
  updateHotelType,
  deleteHotelType
}; 