const { db } = require('../config/database');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../services/emailService');

// Get all hotels
const getAllHotels = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT h.*, m.ldg_market_name, ht.ldg_hotel_type as hotel_type_name
      FROM mstldg_hotelmasters h
      LEFT JOIN ldg_mstmarkets m ON h.marketid = m.ldg_marketid
      LEFT JOIN ldg_mstlodgehoteltype ht ON h.hoteltypeid = ht.ldg_hoteltypeid
      ORDER BY h.ldg_hotelid DESC
    `);
    const hotels = stmt.all();
    
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotels', details: error.message });
  }
};

// Get single hotel by ID
const getHotelById = (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare(`
      SELECT h.*, m.ldg_market_name, ht.ldg_hotel_type as hotel_type_name
      FROM mstldg_hotelmasters h
      LEFT JOIN ldg_mstmarkets m ON h.marketid = m.ldg_marketid
      LEFT JOIN ldg_mstlodgehoteltype ht ON h.hoteltypeid = ht.ldg_hoteltypeid
      WHERE h.ldg_hotelid = ?
    `);
    const hotel = stmt.get(id);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel', details: error.message });
  }
};

// Create new hotel
const createHotel = async (req, res) => {
  const { 
    hotel_name, 
    marketid, 
    short_name, 
    phone, 
    email, 
    password,
    fssai_no, 
    trn_gstno, 
    panno, 
    website, 
    address, 
    stateid, 
    hoteltypeid, 
    ldg_HotelType, 
    ldg_Shop_Act_Number,
    Masteruserid 
  } = req.body;

  console.log('Received hotel data:', {
    hotel_name,
    email,
    password: password ? '***' : 'undefined',
    marketid,
    stateid
  });

  if (!hotel_name) {
    return res.status(400).json({ error: 'Hotel name is required' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required for login account' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required for login account' });
  }

  try {
    // Check if email already exists in hotels table
    const existingHotel = db.prepare('SELECT id FROM hotels WHERE email = ?').get(email);
    if (existingHotel) {
      return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
    }

    // Validate stateid if provided
    if (stateid) {
      const stateExists = db.prepare('SELECT id FROM states WHERE id = ?').get(stateid);
      if (!stateExists) {
        return res.status(400).json({ error: 'Invalid state ID provided' });
      }
    }

    // Validate marketid if provided
    if (marketid) {
      const marketExists = db.prepare('SELECT ldg_marketid FROM ldg_mstmarkets WHERE ldg_marketid = ?').get(marketid);
      if (!marketExists) {
        return res.status(400).json({ error: 'Invalid market ID provided' });
      }
    }

    // Validate hoteltypeid if provided
    if (hoteltypeid) {
      const hotelTypeExists = db.prepare('SELECT ldg_hoteltypeid FROM ldg_mstlodgehoteltype WHERE ldg_hoteltypeid = ?').get(hoteltypeid);
      if (!hotelTypeExists) {
        return res.status(400).json({ error: 'Invalid hotel type ID provided' });
      }
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    // Start transaction
    const transaction = db.transaction(() => {
      try {
        // First, create the hotel master record
        const hotelMasterStmt = db.prepare(`
          INSERT INTO mstldg_hotelmasters (
            hotel_name, marketid, short_name, phone, email, fssai_no, trn_gstno,
            panno, website, address, stateid, hoteltypeid, ldg_HotelType,
            ldg_Shop_Act_Number, Masteruserid, ldg_blocked
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const hotelMasterResult = hotelMasterStmt.run(
          hotel_name, marketid, short_name, phone, email, fssai_no, trn_gstno,
          panno, website, address, stateid, hoteltypeid, ldg_HotelType,
          ldg_Shop_Act_Number, Masteruserid, 0
        );
        console.log('Hotel master record created with ID:', hotelMasterResult.lastInsertRowid);

        // Then, create the login account in hotels table
        const loginStmt = db.prepare(`
          INSERT INTO hotels (
            email, password, name, hotel_name, phone, address,
            state_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const loginResult = loginStmt.run(
          email, hashedPassword, hotel_name, hotel_name, phone, address,
          stateid
        );
        console.log('Login account created with ID:', loginResult.lastInsertRowid);

        return {
          hotelMasterId: hotelMasterResult.lastInsertRowid,
          loginId: loginResult.lastInsertRowid
        };
      } catch (transactionError) {
        console.error('Transaction error:', transactionError);
        console.error('Transaction error details:', {
          message: transactionError.message,
          code: transactionError.code,
          stack: transactionError.stack
        });
        throw transactionError;
      }
    });

    const result = transaction();

    // Get the newly created hotel master record
    const newHotel = db.prepare(`
      SELECT * FROM mstldg_hotelmasters WHERE ldg_hotelid = ?
    `).get(result.hotelMasterId);

    console.log('Hotel created successfully:', newHotel);

    // Send welcome email to hotel owner
    let emailSent = false;
    try {
      await sendWelcomeEmail({
        hotel_name: hotel_name,
        email: email,
        password: password, // Send the original password for the email
        phone: phone,
        address: address
      });
      console.log('📧 Welcome email sent to:', email);
      emailSent = true;
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      console.log('⚠️ Hotel created successfully but email notification failed');
      // Don't fail the entire operation if email fails
    }

    res.status(201).json({
      message: 'Hotel created successfully! Login account has been created with the provided email and password.',
      hotel: newHotel,
      loginAccount: {
        email: email,
        message: 'Login credentials created successfully'
      },
      emailStatus: emailSent ? 'Email sent successfully' : 'Email notification failed (hotel created successfully)'
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create hotel';
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      errorMessage = 'Invalid reference data provided (state, market, or hotel type)';
    } else if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      errorMessage = 'Email already exists. Please use a different email.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ error: errorMessage, details: error.message });
  }
};

// Update hotel
const updateHotel = (req, res) => {
  const { id } = req.params;
  const { 
    hotel_name, 
    marketid, 
    short_name, 
    phone, 
    email, 
    fssai_no, 
    trn_gstno, 
    panno, 
    website, 
    address, 
    stateid, 
    hoteltypeid, 
    ldg_HotelType, 
    ldg_Shop_Act_Number,
    status,
    Masteruserid 
  } = req.body;

  if (!hotel_name) {
    return res.status(400).json({ error: 'Hotel name is required' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE mstldg_hotelmasters 
      SET hotel_name = ?, marketid = ?, short_name = ?, phone = ?, email = ?, 
          fssai_no = ?, trn_gstno = ?, panno = ?, website = ?, address = ?, 
          stateid = ?, hoteltypeid = ?, ldg_HotelType = ?, ldg_Shop_Act_Number = ?,
          status = ?, updated_date = CURRENT_TIMESTAMP, Masteruserid = ?
      WHERE ldg_hotelid = ?
    `);
    const result = stmt.run(
      hotel_name, marketid, short_name, phone, email, fssai_no, trn_gstno,
      panno, website, address, stateid, hoteltypeid, ldg_HotelType,
      ldg_Shop_Act_Number, status || 1, Masteruserid, id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Get the updated hotel
    const updatedHotel = db.prepare(`
      SELECT * FROM mstldg_hotelmasters WHERE ldg_hotelid = ?
    `).get(id);

    res.json({
      message: 'Hotel updated successfully!',
      hotel: updatedHotel
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hotel', details: error.message });
  }
};

// Delete hotel (hard delete - completely remove from database)
const deleteHotel = (req, res) => {
  const { id } = req.params;
  
  console.log('Delete request received for hotel ID:', id);

  try {
    // First, get the hotel email to also delete from hotels table
    const hotelStmt = db.prepare('SELECT email FROM mstldg_hotelmasters WHERE ldg_hotelid = ?');
    const hotel = hotelStmt.get(id);
    
    if (!hotel) {
      console.log('No hotel found with ID:', id);
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Start transaction to delete from both tables
    const transaction = db.transaction(() => {
      // Delete from hotels table (login account)
      const deleteLoginStmt = db.prepare('DELETE FROM hotels WHERE email = ?');
      const loginResult = deleteLoginStmt.run(hotel.ldg_email);
      console.log('Login account deleted, changes:', loginResult.changes);

      // Delete from mstldg_hotelmasters table
      const deleteHotelStmt = db.prepare('DELETE FROM mstldg_hotelmasters WHERE ldg_hotelid = ?');
      const hotelResult = deleteHotelStmt.run(id);
      console.log('Hotel master record deleted, changes:', hotelResult.changes);

      return {
        loginChanges: loginResult.changes,
        hotelChanges: hotelResult.changes
      };
    });

    const result = transaction();
    
    console.log('Delete result:', result);

    if (result.hotelChanges === 0) {
      console.log('No hotel found with ID:', id);
      return res.status(404).json({ error: 'Hotel not found' });
    }

    console.log('Hotel deleted successfully, changes:', result);
    res.json({ 
      message: 'Hotel deleted successfully!',
      details: {
        hotelRecord: result.hotelChanges,
        loginAccount: result.loginChanges
      }
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Failed to delete hotel', details: error.message });
  }
};

// Toggle hotel blocked status
const toggleHotelBlock = (req, res) => {
  const { id } = req.params;

  console.log('Toggle block request received for hotel ID:', id);

  try {
    // First, get the current blocked status
    const hotelStmt = db.prepare('SELECT ldg_blocked FROM mstldg_hotelmasters WHERE ldg_hotelid = ?');
    const hotel = hotelStmt.get(id);

    if (!hotel) {
      console.log('No hotel found with ID:', id);
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Toggle the blocked status
    const newBlockedStatus = hotel.ldg_blocked === 1 ? 0 : 1;
    const action = newBlockedStatus === 1 ? 'blocked' : 'unblocked';

    // Start transaction to update both tables
    const transaction = db.transaction(() => {
      // Update mstldg_hotelmasters table
      const updateHotelStmt = db.prepare('UPDATE mstldg_hotelmasters SET ldg_blocked = ? WHERE ldg_hotelid = ?');
      const hotelResult = updateHotelStmt.run(newBlockedStatus, id);
      console.log('Hotel master record updated, changes:', hotelResult.changes);

      // Update hotels table (login account) - hotels table doesn't have ldg_blocked column
      // const updateLoginStmt = db.prepare('UPDATE hotels SET ldg_blocked = ? WHERE email = (SELECT email FROM mstldg_hotelmasters WHERE ldg_hotelid = ?)');
      // const loginResult = updateLoginStmt.run(newBlockedStatus, id);
      // console.log('Login account updated, changes:', loginResult.changes);

      return {
        hotelChanges: hotelResult.changes,
        loginChanges: 0 // hotels table doesn't have ldg_blocked column
      };
    });

    const result = transaction();

    console.log('Block toggle result:', result);

    if (result.hotelChanges === 0) {
      console.log('No hotel found with ID:', id);
      return res.status(404).json({ error: 'Hotel not found' });
    }

    console.log(`Hotel ${action} successfully`);
    res.json({
      message: `Hotel ${action} successfully!`,
      blocked: newBlockedStatus === 1,
      details: {
        hotelRecord: result.hotelChanges,
        loginAccount: result.loginChanges
      }
    });
  } catch (error) {
    console.error('Error toggling hotel block:', error);
    res.status(500).json({ error: 'Failed to toggle hotel block status', details: error.message });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  toggleHotelBlock
}; 