const { db } = require('../config/database');

// Sample zones data (using only available district IDs 1-10)
const sampleZones = [
  { zonename: 'South Mumbai', zonecode: 'SM', districtid: 1, description: 'Premium residential and business area' },
  { zonename: 'North Mumbai', zonecode: 'NM', districtid: 1, description: 'Suburban residential area' },
  { zonename: 'Pune City', zonecode: 'PC', districtid: 2, description: 'Educational and IT hub' },
  { zonename: 'Pune Rural', zonecode: 'PR', districtid: 2, description: 'Agricultural and industrial area' },
  { zonename: 'Nagpur Central', zonecode: 'NC', districtid: 3, description: 'Administrative and business center' },
  { zonename: 'Nagpur Industrial', zonecode: 'NI', districtid: 3, description: 'Industrial and manufacturing area' },
  { zonename: 'Central Delhi', zonecode: 'CD', districtid: 4, description: 'Government and administrative center' },
  { zonename: 'New Delhi', zonecode: 'ND', districtid: 4, description: 'Diplomatic and business district' },
  { zonename: 'Bangalore Central', zonecode: 'BC', districtid: 5, description: 'IT corridor and business district' },
  { zonename: 'Bangalore North', zonecode: 'BN', districtid: 5, description: 'Residential and educational area' },
  { zonename: 'Mysore Palace', zonecode: 'MP', districtid: 6, description: 'Historic and tourist area' },
  { zonename: 'Mysore Industrial', zonecode: 'MI', districtid: 6, description: 'Industrial and manufacturing area' },
  { zonename: 'Chennai Central', zonecode: 'CC', districtid: 7, description: 'Business and cultural hub' },
  { zonename: 'Chennai South', zonecode: 'CS', districtid: 7, description: 'Residential and beach area' },
  { zonename: 'Coimbatore Textile', zonecode: 'CT', districtid: 8, description: 'Textile and manufacturing hub' },
  { zonename: 'Coimbatore IT', zonecode: 'CI', districtid: 8, description: 'IT and educational area' },
  { zonename: 'Ahmedabad Old City', zonecode: 'AO', districtid: 9, description: 'Historic and cultural area' },
  { zonename: 'Ahmedabad New City', zonecode: 'AN', districtid: 9, description: 'Modern business and residential area' },
  { zonename: 'Surat Diamond', zonecode: 'SD', districtid: 10, description: 'Diamond and jewelry trade center' },
  { zonename: 'Surat Textile', zonecode: 'ST', districtid: 10, description: 'Textile manufacturing and trade area' }
];

// Function to seed zones
const seedZones = () => {
  try {
    console.log('🌱 Seeding zones...');
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM ldg_zones').get();
    if (existingCount.count > 0) {
      console.log(`✅ Zones already exist (${existingCount.count} zones found)`);
      return;
    }
    const stmt = db.prepare('INSERT INTO ldg_zones (zonename, zonecode, districtid, description) VALUES (?, ?, ?, ?)');
    for (const zone of sampleZones) {
      stmt.run(zone.zonename, zone.zonecode, zone.districtid, zone.description);
      console.log(`✅ Added: ${zone.zonename} (${zone.zonecode})`);
    }
    console.log(`🎉 Successfully seeded ${sampleZones.length} zones!`);
  } catch (error) {
    console.error('❌ Error seeding zones:', error);
  }
};

seedZones(); 