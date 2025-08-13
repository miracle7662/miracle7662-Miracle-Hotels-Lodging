const { db } = require('../config/database');

// Get all blocks
const getAllBlocks = (req, res) => {
  try {
    const blocks = db.prepare(`
      SELECT * FROM mstldgblockmaster 
      ORDER BY block_name
    `).all();
    console.log('Fetched blocks:', blocks);
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocks', details: error.message });
  }
};

// Get single block by ID
const getBlockById = (req, res) => {
  try {
    const block = db.prepare(`
      SELECT * FROM mstldgblockmaster 
      WHERE blockid = ? AND status = 1
    `).get(req.params.id);
    
    if (block) {
      res.json(block);
    } else {
      res.status(404).json({ error: 'Block not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch block', details: error.message });
  }
};

// Create new block
const createBlock = (req, res) => {
  const { block_name, display_name, Hotel_id } = req.body;
  
  if (!block_name || !display_name) {
    return res.status(400).json({ error: 'Block name and display name are required' });
  }

  // Get current user ID from request (from JWT token)
  const currentUserId = req.user ? req.user.id : null;
  console.log('Current user ID:', currentUserId);

  try {
    const stmt = db.prepare(`
      INSERT INTO mstldgblockmaster (block_name, display_name, Hotel_id, Created_by_id, created_date) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(block_name, display_name, Hotel_id, currentUserId);
    
    // Get the newly created block
    const newBlock = db.prepare(`
      SELECT * FROM mstldgblockmaster WHERE blockid = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Block created successfully!',
      block: newBlock
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create block', details: error.message });
  }
};

// Update block
const updateBlock = (req, res) => {
  const { block_name, display_name, Hotel_id } = req.body;
  const { id } = req.params;

  if (!block_name || !display_name) {
    return res.status(400).json({ error: 'Block name and display name are required' });
  }

  // Get current user ID from request (from JWT token)
  const currentUserId = req.user ? req.user.id : null;
  console.log('Current user ID for update:', currentUserId);

  try {
    const stmt = db.prepare(`
      UPDATE mstldgblockmaster 
      SET block_name = ?, display_name = ?, Hotel_id = ?, 
          Updated_by_id = ?, Updated_date = CURRENT_TIMESTAMP 
      WHERE blockid = ?
    `);
    const result = stmt.run(block_name, display_name, Hotel_id, currentUserId, id);
    
    if (result.changes > 0) {
      res.json({ message: 'Block updated successfully!' });
    } else {
      res.status(404).json({ error: 'Block not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update block', details: error.message });
  }
};

// Delete block (soft delete)
const deleteBlock = (req, res) => {
  // Get current user ID from request (from JWT token)
  const currentUserId = req.user ? req.user.id : null;
  console.log('Current user ID for delete:', currentUserId);

  try {
    const stmt = db.prepare(`
      UPDATE mstldgblockmaster 
      SET status = 0, Updated_by_id = ?, Updated_date = CURRENT_TIMESTAMP 
      WHERE blockid = ?
    `);
    const result = stmt.run(currentUserId, req.params.id);
    
    if (result.changes > 0) {
      res.json({ message: 'Block deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Block not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete block', details: error.message });
  }
};

// Get blocks by hotel ID
const getBlocksByHotelId = (req, res) => {
  try {
    const blocks = db.prepare(`
      SELECT * FROM mstldgblockmaster 
      WHERE Hotel_id = ? AND status = 1 
      ORDER BY block_name
    `).all(req.params.hotelId);
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocks for hotel', details: error.message });
  }
};

// Get blocks for current user's hotel
const getBlocksForCurrentUser = (req, res) => {
  try {
    // Get current user ID from JWT token
    const currentUserId = req.user ? req.user.id : null;
    console.log('Getting blocks for current user ID:', currentUserId);
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get blocks for the current user's hotel
    const blocks = db.prepare(`
      SELECT * FROM mstldgblockmaster 
      WHERE Hotel_id = ? 
      ORDER BY block_name
    `).all(currentUserId);
    
    console.log(`Found ${blocks.length} blocks for user ${currentUserId}`);
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocks for current user', details: error.message });
  }
};

module.exports = {
  getAllBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
  getBlocksByHotelId,
  getBlocksForCurrentUser
}; 