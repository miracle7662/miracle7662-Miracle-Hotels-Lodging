const { db } = require('./config/database');

console.log('🔍 Checking hotel users in database...');

// Check hotels table
const hotels = db.prepare('SELECT * FROM hotels WHERE status = 1').all();
console.log('🔍 Hotels found:', hotels.length);
hotels.forEach(hotel => {
  console.log(`🔍 Hotel: ID=${hotel.id}, Name=${hotel.name}, Email=${hotel.email}, Status=${hotel.status}`);
});

// Check mstldg_hotelmasters table
const hotelMasters = db.prepare('SELECT * FROM mstldg_hotelmasters').all();
console.log('🔍 Hotel Masters found:', hotelMasters.length);
hotelMasters.forEach(hotel => {
  console.log(`🔍 Hotel Master: ID=${hotel.ldg_hotelid}, Name=${hotel.hotel_name}, Email=${hotel.ldg_email}, Status=${hotel.ldg_status}`);
});

console.log('🔍 Database check complete'); 