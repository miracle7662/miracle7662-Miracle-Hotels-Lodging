const { db } = require('../config/database');

const cities = [
  // Mumbai District (ID: 1)
  { name: 'Mumbai City', code: 'MUM', district_id: 1, description: 'Financial capital of India' },
  { name: 'Thane', code: 'THN', district_id: 1, description: 'Suburban city' },
  { name: 'Navi Mumbai', code: 'NVM', district_id: 1, description: 'Planned city' },
  { name: 'Mumbai Suburban', code: 'MSB', district_id: 1, description: 'Suburban area' },
  
  // Pune District (ID: 2)
  { name: 'Pune City', code: 'PUN', district_id: 2, description: 'Oxford of the East' },
  { name: 'Pimpri-Chinchwad', code: 'PCH', district_id: 2, description: 'Industrial city' },
  { name: 'Lonavala', code: 'LNV', district_id: 2, description: 'Hill station' },
  
  // Nagpur District (ID: 3)
  { name: 'Nagpur City', code: 'NAG', district_id: 3, description: 'Orange City' },
  { name: 'Wardha', code: 'WRD', district_id: 3, description: 'Gandhi\'s city' },
  
  // New Delhi District (ID: 4)
  { name: 'New Delhi', code: 'NDL', district_id: 4, description: 'Capital of India' },
  { name: 'Old Delhi', code: 'ODL', district_id: 4, description: 'Historic city' },
  
  // Bangalore District (ID: 5)
  { name: 'Bangalore City', code: 'BLR', district_id: 5, description: 'Silicon Valley of India' },
  { name: 'Electronic City', code: 'ELC', district_id: 5, description: 'IT hub' },
  { name: 'Whitefield', code: 'WFD', district_id: 5, description: 'Tech corridor' },
  
  // Mysore District (ID: 6)
  { name: 'Mysore City', code: 'MYS', district_id: 6, description: 'City of Palaces' },
  { name: 'Mandya', code: 'MND', district_id: 6, description: 'Sugar city' },
  
  // Chennai District (ID: 7)
  { name: 'Chennai City', code: 'CHN', district_id: 7, description: 'Gateway to South India' },
  { name: 'Chengalpattu', code: 'CGP', district_id: 7, description: 'Suburban city' },
  
  // Coimbatore District (ID: 8)
  { name: 'Coimbatore City', code: 'CBE', district_id: 8, description: 'Manchester of South India' },
  { name: 'Tiruppur', code: 'TPR', district_id: 8, description: 'Textile city' },
  
  // Ahmedabad District (ID: 9)
  { name: 'Ahmedabad City', code: 'AMD', district_id: 9, description: 'Manchester of India' },
  { name: 'Gandhinagar', code: 'GND', district_id: 9, description: 'Capital city' },
  
  // Surat District (ID: 10)
  { name: 'Surat City', code: 'SUR', district_id: 10, description: 'Diamond City' },
  { name: 'Bharuch', code: 'BRC', district_id: 10, description: 'Industrial city' }
];

const seedCities = () => {
  try {
    console.log('🌆 Seeding cities...');
    
    // Clear existing cities
    db.prepare('DELETE FROM cities').run();
    
    // Insert cities
    const insertCity = db.prepare(`
      INSERT INTO cities (name, code, district_id, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    cities.forEach(city => {
      insertCity.run(city.name, city.code, city.district_id, city.description);
    });
    
    console.log(`✅ Successfully seeded ${cities.length} cities!`);
    console.log('📁 Cities data:');
    cities.forEach(city => {
      console.log(`   - ${city.name} (${city.code}) - ${city.description}`);
    });
  } catch (error) {
    console.error('❌ Error seeding cities:', error);
  }
};

// Run the seeding
seedCities();
