// const { db } = require('../config/database');

// // Validation function for room data
// const validateRoom = ({ room_no, room_name, display_name, category_id, hotel_id }) => {
//   if (!room_no || typeof room_no !== 'string' || room_no.length > 50) {
//     return 'Room number is required and must be a string (max 50 characters)';
//   }
//   if (!room_name || typeof room_name !== 'string' || room_name.length > 100) {
//     return 'Room name is required and must be a string (max 100 characters)';
//   }
//   if (display_name && typeof display_name !== 'string' || display_name?.length > 100) {
//     return 'Display name must be a string (max 100 characters)';
//   }
//   if (!Number.isInteger(Number(category_id))) {
//     return 'Category ID must be an integer';
//   }
//   if (hotel_id && !Number.isInteger(Number(hotel_id))) {
//     return 'Hotel ID must be an integer';
//   }
//   return null;
// };

// // Get all rooms
// const getAllRooms = (req, res) => {
//   try {
//     const rooms = db.prepare(`
//       SELECT * FROM ldg_mstroommaster 
//       WHERE status = 1
//       ORDER BY room_no
//     `).all();
//     res.json(rooms);
//   } catch (error) {
//     console.error('Error fetching rooms:', error);
//     res.status(500).json({ error: 'Failed to fetch rooms' });
//   }
// };

// // Get single room by ID
// const getRoomById = (req, res) => {
//   try {
//     const room = db.prepare(`
//       SELECT * FROM ldg_mstroommaster 
//       WHERE room_id = ? AND status = 1
//     `).get(req.params.id);
//     if (room) {
//       res.json(room);
//     } else {
//       res.status(404).json({ error: 'Room not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching room:', error);
//     res.status(500).json({ error: 'Failed to fetch room' });
//   }
// };

// // Create new room
// const createRoom = (req, res) => {
//   const { room_no, room_name, display_name, category_id, room_ext_no, room_status, department_id, blockid, floorid, hotel_id } = req.body;

//   // Authentication check
//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ error: 'User not authenticated' });
//   }
//   const currentUserId = req.user.id;

//   // Input validation
//   const validationError = validateRoom({ room_no, room_name, display_name, category_id, hotel_id });
//   if (validationError) {
//     return res.status(400).json({ error: validationError });
//   }

//   try {
//     db.exec('BEGIN TRANSACTION');
//     const stmt = db.prepare(`
//       INSERT INTO ldg_mstroommaster (
//         room_no, room_name, display_name, category_id, room_ext_no, 
//         room_status, department_id, blockid, floorid, hotel_id, 
//         created_by_id, created_date
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
//     `);
//     const result = stmt.run(
//       room_no, 
//       room_name, 
//       display_name || null, 
//       category_id, 
//       room_ext_no || null, 
//       room_status || 'available', 
//       department_id || null, 
//       blockid || null, 
//       floorid || null, 
//       hotel_id || null, 
//       currentUserId
//     );

//     const newRoom = db.prepare(`
//       SELECT * FROM ldg_mstroommaster WHERE room_id = ?
//     `).get(result.lastInsertRowid);

//     db.exec('COMMIT');
//     res.status(201).json({
//       message: 'Room created successfully!',
//       room: newRoom,
//     });
//   } catch (error) {
//     db.exec('ROLLBACK');
//     console.error('Error creating room:', error);
//     res.status(500).json({ error: 'Failed to create room' });
//   }
// };

// // Update room
// const updateRoom = (req, res) => {
//   const { room_no, room_name, display_name, category_id, room_ext_no, room_status, department_id, blockid, floorid, hotel_id } = req.body;
//   const { id } = req.params;

//   // Authentication check
//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ error: 'User not authenticated' });
//   }
//   const currentUserId = req.user.id;

//   // Input validation
//   const validationError = validateRoom({ room_no, room_name, display_name, category_id, hotel_id });
//   if (validationError) {
//     return res.status(400).json({ error: validationError });
//   }

//   try {
//     const stmt = db.prepare(`
//       UPDATE ldg_mstroommaster 
//       SET room_no = ?, room_name = ?, display_name = ?, category_id = ?, 
//           room_ext_no = ?, room_status = ?, department_id = ?, blockid = ?, 
//           floorid = ?, hotel_id = ?, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP 
//       WHERE room_id = ? AND status = 1
//     `);
//     const result = stmt.run(
//       room_no, 
//       room_name, 
//       display_name || null, 
//       category_id, 
//       room_ext_no || null, 
//       room_status || 'available', 
//       department_id || null, 
//       blockid || null, 
//       floorid || null, 
//       hotel_id || null, 
//       currentUserId, 
//       id
//     );

//     if (result.changes > 0) {
//       res.json({ message: 'Room updated successfully!' });
//     } else {
//       res.status(404).json({ error: 'Room not found or inactive' });
//     }
//   } catch (error) {
//     console.error('Error updating room:', error);
//     res.status(500).json({ error: 'Failed to update room' });
//   }
// };

// // Delete room (soft delete)
// const deleteRoom = (req, res) => {
//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ error: 'User not authenticated' });
//   }
//   const currentUserId = req.user.id;

//   try {
//     const stmt = db.prepare(`
//       UPDATE ldg_mstroommaster 
//       SET status = 0, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP 
//       WHERE room_id = ? AND status = 1
//     `);
//     const result = stmt.run(currentUserId, req.params.id);

//     if (result.changes > 0) {
//       res.json({ message: 'Room deleted successfully!' });
//     } else {
//       res.status(404).json({ error: 'Room not found or already inactive' });
//     }
//   } catch (error) {
//     console.error('Error deleting room:', error);
//     res.status(500).json({ error: 'Failed to delete room' });
//   }
// };

// // Get rooms by hotel ID
// const getRoomsByHotelId = (req, res) => {
//   try {
//     const rooms = db.prepare(`
//       SELECT * FROM ldg_mstroommaster 
//       WHERE hotel_id = ? AND status = 1 
//       ORDER BY room_no
//     `).all(req.params.hotelId);
//     res.json(rooms);
//   } catch (error) {
//     console.error('Error fetching rooms for hotel:', error);
//     res.status(500).json({ error: 'Failed to fetch rooms for hotel' });
//   }
// };

// // Get rooms for current user's hotel
// const getRoomsForCurrentUser = (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }
//     const currentUserId = req.user.id;

//     // Assuming user has hotel_id in JWT or a users table
//     const user = db.prepare('SELECT hotel_id FROM users WHERE id = ?').get(currentUserId);
//     if (!user || !user.hotel_id) {
//       return res.status(404).json({ error: 'No hotel associated with this user' });
//     }

//     const rooms = db.prepare(`
//       SELECT * FROM ldg_mstroommaster 
//       WHERE hotel_id = ? AND status = 1 
//       ORDER BY room_no
//     `).all(user.hotel_id);
//     res.json(rooms);
//   } catch (error) {
//     console.error('Error fetching rooms for user:', error);
//     res.status(500).json({ error: 'Failed to fetch rooms for current user' });
//   }
// };

// module.exports = {
//   getAllRooms,
//   getRoomById,
//   createRoom,
//   updateRoom,
//   deleteRoom,
//   getRoomsByHotelId,
//   getRoomsForCurrentUser,
// };



const { db } = require('../config/database');

// Validation function for room data
const validateRoom = ({ room_no, room_name, display_name, category_id, hotel_id }) => {
  if (!room_no || typeof room_no !== 'string' || room_no.length > 50) {
    return 'Room number is required and must be a string (max 50 characters)';
  }
  if (!room_name || typeof room_name !== 'string' || room_name.length > 100) {
    return 'Room name is required and must be a string (max 100 characters)';
  }
  if (display_name && typeof display_name !== 'string' || display_name?.length > 100) {
    return 'Display name must be a string (max 100 characters)';
  }
  if (!Number.isInteger(Number(category_id))) {
    return 'Category ID must be an integer';
  }
  if (hotel_id && !Number.isInteger(Number(hotel_id))) {
    return 'Hotel ID must be an integer';
  }
  return null;
};

// Get all rooms
const getAllRooms = (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT * FROM ldg_mstroommaster 
      WHERE status = 1
      ORDER BY room_no
    `).all();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get single room by ID
const getRoomById = (req, res) => {
  try {
    const room = db.prepare(`
      SELECT * FROM ldg_mstroommaster 
      WHERE room_id = ? AND status = 1
    `).get(req.params.id);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

// Create new room
const createRoom = (req, res) => {
  const { room_no, room_name, display_name, category_id, room_ext_no, room_status, department_id, blockid, floorid, hotel_id } = req.body;

  // Authentication check
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const currentUserId = req.user.id;

  // Input validation
  const validationError = validateRoom({ room_no, room_name, display_name, category_id, hotel_id });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    db.exec('BEGIN TRANSACTION');
    const stmt = db.prepare(`
      INSERT INTO ldg_mstroommaster (
        room_no, room_name, display_name, category_id, room_ext_no, 
        room_status, department_id, blockid, floorid, hotel_id, 
        created_by_id, created_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(
      room_no, 
      room_name, 
      display_name || null, 
      category_id, 
      room_ext_no || null, 
      room_status || 'available', 
      department_id || null, 
      blockid || null, 
      floorid || null, 
      hotel_id || null, 
      currentUserId
    );

    const newRoom = db.prepare(`
      SELECT * FROM ldg_mstroommaster WHERE room_id = ?
    `).get(result.lastInsertRowid);

    db.exec('COMMIT');
    res.status(201).json({
      message: 'Room created successfully!',
      room: newRoom,
    });
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// Update room
const updateRoom = (req, res) => {
  const { room_no, room_name, display_name, category_id, room_ext_no, room_status, department_id, blockid, floorid, hotel_id } = req.body;
  const { id } = req.params;

  // Authentication check
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const currentUserId = req.user.id;

  // Input validation
  const validationError = validateRoom({ room_no, room_name, display_name, category_id, hotel_id });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstroommaster 
      SET room_no = ?, room_name = ?, display_name = ?, category_id = ?, 
          room_ext_no = ?, room_status = ?, department_id = ?, blockid = ?, 
          floorid = ?, hotel_id = ?, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP 
      WHERE room_id = ? AND status = 1
    `);
    const result = stmt.run(
      room_no, 
      room_name, 
      display_name || null, 
      category_id, 
      room_ext_no || null, 
      room_status || 'available', 
      department_id || null, 
      blockid || null, 
      floorid || null, 
      hotel_id || null, 
      currentUserId, 
      id
    );

    if (result.changes > 0) {
      res.json({ message: 'Room updated successfully!' });
    } else {
      res.status(404).json({ error: 'Room not found or inactive' });
    }
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

// Delete room (soft delete)
const deleteRoom = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const currentUserId = req.user.id;

  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstroommaster 
      SET status = 0, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP 
      WHERE room_id = ? AND status = 1
    `);
    const result = stmt.run(currentUserId, req.params.id);

    if (result.changes > 0) {
      res.json({ message: 'Room deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Room not found or already inactive' });
    }
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

// Get rooms by hotel ID
const getRoomsByHotelId = (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT * FROM ldg_mstroommaster 
      WHERE hotel_id = ? AND status = 1 
      ORDER BY room_no
    `).all(req.params.hotelId);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms for hotel:', error);
    res.status(500).json({ error: 'Failed to fetch rooms for hotel' });
  }
};

// Get rooms for current user's hotel
const getRoomsForCurrentUser = (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const currentUserId = req.user.id;

    // Assuming user has hotel_id in JWT or a users table
    const user = db.prepare('SELECT hotel_id FROM users WHERE id = ?').get(currentUserId);
    if (!user || !user.hotel_id) {
      return res.status(404).json({ error: 'No hotel associated with this user' });
    }

    const rooms = db.prepare(`
      SELECT * FROM ldg_mstroommaster 
      WHERE hotel_id = ? AND status = 1 
      ORDER BY room_no
    `).all(user.hotel_id);
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms for user:', error);
    res.status(500).json({ error: 'Failed to fetch rooms for current user' });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHotelId,
  getRoomsForCurrentUser,
};