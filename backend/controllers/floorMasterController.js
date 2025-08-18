const { db } = require('../config/database');

// Get all floors
const getAllFloors = (req, res) => {
  try {
    const floors = db.prepare(`
      SELECT * FROM ldg_mstfloormaster 
      ORDER BY floor_name
    `).all();
    
    res.json(floors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floors', details: error.message });
  }
};

// Get single floor by ID
const getFloorById = (req, res) => {
  const { id } = req.params;
  
  try {
    const floor = db.prepare(`
      SELECT * FROM ldg_mstfloormaster WHERE floorid = ?
    `).get(id);
    
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    res.json(floor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floor', details: error.message });
  }
};

// Create new floor
const createFloor = (req, res) => {
  const { floor_name, display_name, Hotel_id } = req.body;
  const currentUserId = req.user ? req.user.id : null; // Get current user ID from request
  
  if (!floor_name || !display_name) {
    return res.status(400).json({ error: 'Floor name and display name are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO ldg_mstfloormaster (floor_name, display_name, Hotel_id, Created_by_id, created_date) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(floor_name, display_name, Hotel_id, currentUserId);
    
    // Get the newly created floor
    const newFloor = db.prepare(`
      SELECT * FROM ldg_mstfloormaster WHERE floorid = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Floor created successfully!',
      floor: newFloor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create floor', details: error.message });
  }
};

// Update floor
const updateFloor = (req, res) => {
  const { id } = req.params;
  const { floor_name, display_name, status, Hotel_id } = req.body;
  const currentUserId = req.user ? req.user.id : null; // Get current user ID from request
  
  if (!floor_name || !display_name) {
    return res.status(400).json({ error: 'Floor name and display name are required' });
  }

  try {
    const database = db();
    if (!database) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const stmt = db.prepare(`
      UPDATE ldg_mstfloormaster 
      SET floor_name = ?, display_name = ?, status = ?, Hotel_id = ?, Updated_by_id = ?, Updated_date = CURRENT_TIMESTAMP
      WHERE floorid = ?
    `);
    const result = stmt.run(floor_name, display_name, status, Hotel_id, currentUserId, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    // Get the updated floor
    const updatedFloor = db.prepare(`
      SELECT * FROM ldg_mstfloormaster WHERE floorid = ?
    `).get(id);
    
    res.json({
      message: 'Floor updated successfully!',
      floor: updatedFloor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update floor', details: error.message });
  }
};

// Delete floor
const deleteFloor = (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user ? req.user.id : null; // Get current user ID from request
  
  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstfloormaster 
      SET status = 0, Updated_by_id = ?, Updated_date = CURRENT_TIMESTAMP
      WHERE floorid = ?
    `);
    const result = stmt.run(currentUserId, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Floor not found' });
    }
    
    res.json({ message: 'Floor deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete floor', details: error.message });
  }
};

// Get floors by hotel ID
const getFloorsByHotelId = (req, res) => {
  const { hotelId } = req.params;
  
  try {
    const floors = db.prepare(`
      SELECT * FROM ldg_mstfloormaster 
      WHERE Hotel_id = ? 
      ORDER BY floor_name
    `).all(hotelId);
    
    res.json(floors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floors by hotel ID', details: error.message });
  }
};

// Get floors for current user's hotel
const getFloorsForCurrentUser = (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get floors for the current user's hotel
    const floors = db.prepare(`
      SELECT * FROM ldg_mstfloormaster 
      WHERE Hotel_id = ? 
      ORDER BY floor_name
    `).all(currentUserId); 
    
    console.log(`Found ${floors.length} floors for user ${currentUserId}`);
    res.json(floors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floors for current user', details: error.message });
  }
};

module.exports = {
  getAllFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  getFloorsByHotelId,
  getFloorsForCurrentUser
}; 












