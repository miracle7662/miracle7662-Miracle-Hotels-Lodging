const { db } = require('../config/database');

// Sample hotel data
const sampleHotels = [
  {
    hotel_name: 'Grand Plaza Hotel',
    marketid: 1,
    short_name: 'GPH',
    phone: '+91-9876543210',
    email: 'info@grandplaza.com',
    fssai_no: 'FSSAI123456789',
    trn_gstno: 'GST123456789',
    panno: 'ABCDE1234F',
    website: 'https://grandplaza.com',
    address: '123 Main Street, Mumbai, Maharashtra',
    stateid: 1,
    hoteltypeid: 1,
    ldg_HotelType: '12 Noon',
    ldg_Shop_Act_Number: 'SHOP123456',
    Masteruserid: 1
  },
  {
    hotel_name: 'Royal Palace Resort',
    marketid: 2,
    short_name: 'RPR',
    phone: '+91-9876543211',
    email: 'info@royalpalace.com',
    fssai_no: 'FSSAI987654321',
    trn_gstno: 'GST987654321',
    panno: 'BCDEF2345G',
    website: 'https://royalpalace.com',
    address: '456 Beach Road, Goa, Goa',
    stateid: 2,
    hoteltypeid: 2,
    ldg_HotelType: '24 Noon',
    ldg_Shop_Act_Number: 'SHOP654321',
    Masteruserid: 1
  },
  {
    hotel_name: 'Business Inn',
    marketid: 3,
    short_name: 'BI',
    phone: '+91-9876543212',
    email: 'info@businessinn.com',
    fssai_no: 'FSSAI456789123',
    trn_gstno: 'GST456789123',
    panno: 'CDEFG3456H',
    website: 'https://businessinn.com',
    address: '789 Corporate Park, Bangalore, Karnataka',
    stateid: 3,
    hoteltypeid: 3,
    ldg_HotelType: '12 Noon',
    ldg_Shop_Act_Number: 'SHOP456789',
    Masteruserid: 1
  },
  {
    hotel_name: 'Heritage Hotel',
    marketid: 4,
    short_name: 'HH',
    phone: '+91-9876543213',
    email: 'info@heritagehotel.com',
    fssai_no: 'FSSAI789123456',
    trn_gstno: 'GST789123456',
    panno: 'DEFGH4567I',
    website: 'https://heritagehotel.com',
    address: '321 Heritage Lane, Jaipur, Rajasthan',
    stateid: 4,
    hoteltypeid: 4,
    ldg_HotelType: '24 Noon',
    ldg_Shop_Act_Number: 'SHOP789123',
    Masteruserid: 1
  },
  {
    hotel_name: 'Seaside Resort',
    marketid: 5,
    short_name: 'SR',
    phone: '+91-9876543214',
    email: 'info@seasideresort.com',
    fssai_no: 'FSSAI321654987',
    trn_gstno: 'GST321654987',
    panno: 'EFGHI5678J',
    website: 'https://seasideresort.com',
    address: '654 Coastal Drive, Kochi, Kerala',
    stateid: 5,
    hoteltypeid: 5,
    ldg_HotelType: '12 Noon',
    ldg_Shop_Act_Number: 'SHOP321654',
    Masteruserid: 1
  }
];

// Clear existing data and insert new data
const seedHotels = () => {
  try {
    console.log('Starting hotel seeding...');
    
    // Clear existing data
    db.prepare('DELETE FROM mstldg_hotelmasters').run();
    console.log('Cleared existing hotel data');
    
    // Insert sample hotels
    const insertStmt = db.prepare(`
      INSERT INTO mstldg_hotelmasters (
        hotel_name, marketid, short_name, phone, email, fssai_no, trn_gstno, 
        panno, website, address, stateid, hoteltypeid, ldg_HotelType, 
        ldg_Shop_Act_Number, Masteruserid
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleHotels.forEach(hotel => {
      insertStmt.run(
        hotel.hotel_name, hotel.marketid, hotel.short_name, hotel.phone, 
        hotel.email, hotel.fssai_no, hotel.trn_gstno, hotel.panno, 
        hotel.website, hotel.address, hotel.stateid, hotel.hoteltypeid, 
        hotel.ldg_HotelType, hotel.ldg_Shop_Act_Number, hotel.Masteruserid
      );
    });
    
    console.log(`Successfully seeded ${sampleHotels.length} hotels`);
    
    // Verify the data
    const count = db.prepare('SELECT COUNT(*) as count FROM mstldg_hotelmasters').get();
    console.log(`Total hotels in database: ${count.count}`);
    
    // Show the seeded data
    const hotels = db.prepare('SELECT * FROM mstldg_hotelmasters ORDER BY ldg_hotelid').all();
    console.log('Seeded hotels:');
    hotels.forEach(hotel => {
      console.log(`- ${hotel.ldg_hotelid}: ${hotel.hotel_name} (${hotel.ldg_HotelType})`);
    });
    
  } catch (error) {
    console.error('Error seeding hotels:', error);
  }
};

// Run the seeding
seedHotels(); 