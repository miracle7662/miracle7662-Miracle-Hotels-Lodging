const { db } = require('../config/database');

// Get all rooms
const getAllRooms = (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT 
        r.*,
        b.block_name,
        f.floor_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstblockmaster b ON r.blockid = b.blockid
      LEFT JOIN ldg_mstfloormaster f ON r.floorid = f.floorid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.status = 1
      ORDER BY r.room_no
    `).all();
    console.log('Fetched rooms:', rooms);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms', details: error.message });
  }
};

// Get single room by ID
const getRoomById = (req, res) => {
  try {
    const room = db.prepare(`
      SELECT 
        r.*,
        b.block_name,
        f.floor_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstblockmaster b ON r.blockid = b.blockid
      LEFT JOIN ldg_mstfloormaster f ON r.floorid = f.floorid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.room_id = ? AND r.status = 1
    `).get(req.params.id);
    
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room', details: error.message });
  }
};

// Create new room
const createRoom = (req, res) => {
  const { 
    room_no, 
    room_name, 
    display_name, 
    category_id, 
    room_ext_no, 
    room_status, 
    department_id, 
    blockid, 
    floorid, 
    hotel_id 
  } = req.body;
  
  if (!room_no || !room_name || !category_id) {
    return res.status(400).json({ 
      error: 'Room number, room name, and category are required' 
    });
  }

  // Get current user ID from request (from JWT token)
  const currentUserId = req.user ? req.user.id : null;
  console.log('Current user ID:', currentUserId);

  try {
    const stmt = db.prepare(`
      INSERT INTO ldg_mstroommaster (
        room_no, 
        room_name, 
        display_name, 
        category_id, 
        room_ext_no, 
        room_status, 
        department_id, 
        blockid, 
        floorid, 
        hotel_id, 
        created_by_id, 
        created_date
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const result = stmt.run(
      room_no, 
      room_name, 
      display_name, 
      category_id, 
      room_ext_no, 
      room_status || 'available', 
      department_id, 
      blockid, 
      floorid, 
      hotel_id, 
      currentUserId
    );
    
    // Get the newly created room with joins
    const newRoom = db.prepare(`
      SELECT 
        r.*,
        b.block_name,
        f.floor_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstblockmaster b ON r.blockid = b.blockid
      LEFT JOIN ldg_mstfloormaster f ON r.floorid = f.floorid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.room_id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Room created successfully!',
      room: newRoom
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room', details: error.message });
  }
};

// Update room
const updateRoom = (req, res) => {
  const { 
    room_no, 
    room_name, 
    display_name, 
    category_id, 
    room_ext_no, 
    room_status, 
    department_id, 
    blockid, 
    floorid, 
    hotel_id 
  } = req.body;
  const { id } = req.params;

  if (!room_no || !room_name || !category_id) {
    return res.status(400).json({ 
      error: 'Room number, room name, and category are required' 
    });
  }

  // Get current user ID from request (from JWT token)
  const currentUserId = req.user ? req.user.id : null;
  console.log('Current user ID for update:', currentUserId);

  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstroommaster 
      SET 
        room_no = ?, 
        room_name = ?, 
        display_name = ?, 
        category_id = ?, 
        room_ext_no = ?, 
        room_status = ?, 
        department_id = ?, 
        blockid = ?, 
        floorid = ?, 
        hotel_id = ?, 
        updated_by_id = ?, 
        updated_date = CURRENT_TIMESTAMP 
      WHERE room_id = ?
    `);
    
    const result = stmt.run(
      room_no, 
      room_name, 
      display_name, 
      category_id, 
      room_ext_no, 
      room_status, 
      department_id, 
      blockid, 
      floorid, 
      hotel_id, 
      currentUserId, 
      id
    );
    
    if (result.changes > 0) {
      res.json({ message: 'Room updated successfully!' });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room', details: error.message });
  }
};

// Delete room (soft delete)
const deleteRoom = (req, res) => {
  // Get current user ID from request (from JWT token)
  const currentUserId = req.user ? req.user.id : null;
  console.log('Current user ID for delete:', currentUserId);

  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstroommaster 
      SET status = 0, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP 
      WHERE room_id = ?
    `);
    const result = stmt.run(currentUserId, req.params.id);
    
    if (result.changes > 0) {
      res.json({ message: 'Room deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room', details: error.message });
  }
};

// Get rooms by hotel ID
const getRoomsByHotelId = (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT 
        r.*,
        b.block_name,
        f.floor_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstblockmaster b ON r.blockid = b.blockid
      LEFT JOIN ldg_mstfloormaster f ON r.floorid = f.floorid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.hotel_id = ? AND r.status = 1
      ORDER BY r.room_no
    `).all(req.params.hotelId);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms for hotel', details: error.message });
  }
};

// Get rooms by block ID
const getRoomsByBlockId = (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT 
        r.*,
        f.floor_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstfloormaster f ON r.floorid = f.floorid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.blockid = ? AND r.status = 1
      ORDER BY r.room_no
    `).all(req.params.blockId);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms for block', details: error.message });
  }
};

// Get rooms by floor ID
const getRoomsByFloorId = (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT 
        r.*,
        b.block_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstblockmaster b ON r.blockid = b.blockid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.floorid = ? AND r.status = 1
      ORDER BY r.room_no
    `).all(req.params.floorId);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms for floor', details: error.message });
  }
};

// Get rooms for current user's hotel
const getRoomsForCurrentUser = (req, res) => {
  try {
    // Get current user ID from JWT token
    const currentUserId = req.user ? req.user.id : null;
    console.log('Getting rooms for current user ID:', currentUserId);
    
    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get rooms for the current user's hotel
    const rooms = db.prepare(`
      SELECT 
        r.*,
        b.block_name,
        f.floor_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstblockmaster b ON r.blockid = b.blockid
      LEFT JOIN ldg_mstfloormaster f ON r.floorid = f.floorid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.hotel_id = ?
      ORDER BY r.room_no
    `).all(currentUserId);
    
    console.log(`Found ${rooms.length} rooms for user ${currentUserId}`);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms for current user', details: error.message });
  }
};

// Get available rooms
const getAvailableRooms = (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT 
        r.*,
        b.block_name,
        f.floor_name,
        c.category_name
      FROM ldg_mstroommaster r
      LEFT JOIN ldg_mstblockmaster b ON r.blockid = b.blockid
      LEFT JOIN ldg_mstfloormaster f ON r.floorid = f.floorid
      LEFT JOIN ldg_mstroomcategory c ON r.category_id = c.category_id
      WHERE r.room_status = 'available' AND r.status = 1
      ORDER BY r.room_no
    `).all();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available rooms', details: error.message });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHotelId,
  getRoomsByBlockId,
  getRoomsByFloorId,
  getRoomsForCurrentUser,
  getAvailableRooms
};
