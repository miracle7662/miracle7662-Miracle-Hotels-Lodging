const { db } = require('../config/database');

// Sample hotel types data
const hotelTypes = [
  {
    ldg_hotel_type: 'Luxury Hotel',
    ldg_hotelid: 1,
    ldg_marketid: 1
  },
  {
    ldg_hotel_type: 'Business Hotel',
    ldg_hotelid: 2,
    ldg_marketid: 1
  },
  {
    ldg_hotel_type: 'Resort',
    ldg_hotelid: 3,
    ldg_marketid: 2
  },
  {
    ldg_hotel_type: 'Boutique Hotel',
    ldg_hotelid: 4,
    ldg_marketid: 1
  },
  {
    ldg_hotel_type: 'Budget Hotel',
    ldg_hotelid: 5,
    ldg_marketid: 3
  },
  {
    ldg_hotel_type: 'Hostel',
    ldg_hotelid: 6,
    ldg_marketid: 3
  },
  {
    ldg_hotel_type: 'Motel',
    ldg_hotelid: 7,
    ldg_marketid: 2
  },
  {
    ldg_hotel_type: 'Apartment Hotel',
    ldg_hotelid: 8,
    ldg_marketid: 1
  },
  {
    ldg_hotel_type: 'Heritage Hotel',
    ldg_hotelid: 9,
    ldg_marketid: 2
  },
  {
    ldg_hotel_type: 'Eco Hotel',
    ldg_hotelid: 10,
    ldg_marketid: 2
  }
];

// Seed hotel types
const seedHotelTypes = () => {
  try {
    console.log('🌱 Seeding hotel types...');
    
    // Check if table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='ldg_mstlodgehoteltype'
    `).get();
    
    if (!tableExists) {
      console.log('❌ Hotel types table does not exist. Please run the server first to create tables.');
      return;
    }
    
    // Clear existing data
    db.prepare('DELETE FROM ldg_mstlodgehoteltype').run();
    console.log('🗑️  Cleared existing hotel types data');
    
    // Insert hotel types
    const stmt = db.prepare(`
      INSERT INTO ldg_mstlodgehoteltype (ldg_hotel_type, ldg_hotelid, ldg_marketid) 
      VALUES (?, ?, ?)
    `);
    
    let insertedCount = 0;
    for (const hotelType of hotelTypes) {
      stmt.run(hotelType.ldg_hotel_type, hotelType.ldg_hotelid, hotelType.ldg_marketid);
      insertedCount++;
    }
    
    console.log(`✅ Successfully seeded ${insertedCount} hotel types!`);
    
    // Display seeded data
    const seededData = db.prepare(`
      SELECT * FROM ldg_mstlodgehoteltype ORDER BY ldg_hoteltypeid
    `).all();
    
    console.log('\n📋 Seeded hotel types:');
    seededData.forEach((hotelType, index) => {
      console.log(`${index + 1}. ${hotelType.ldg_hotel_type} (Hotel ID: ${hotelType.ldg_hotelid}, Market ID: ${hotelType.ldg_marketid})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding hotel types:', error);
  }
};

// Run the seeding
if (require.main === module) {
  seedHotelTypes();
}

module.exports = { seedHotelTypes }; 