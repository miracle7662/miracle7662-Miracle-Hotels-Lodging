const { db } = require('../config/database');

// Sample districts data for Indian states (using new state IDs from ldg_states)
const sampleDistricts = [
  { distrcitname: 'Mumbai', ditcrictcode: 'MB', stateid: 1, description: 'Financial capital of India' },
  { distrcitname: 'Pune', ditcrictcode: 'PN', stateid: 1, description: 'Oxford of the East' },
  { distrcitname: 'Nagpur', ditcrictcode: 'NG', stateid: 1, description: 'Orange City' },
  { distrcitname: 'New Delhi', ditcrictcode: 'ND', stateid: 2, description: 'Capital of India' },
  { distrcitname: 'Bangalore', ditcrictcode: 'BG', stateid: 3, description: 'Silicon Valley of India' },
  { distrcitname: 'Mysore', ditcrictcode: 'MY', stateid: 3, description: 'City of Palaces' },
  { distrcitname: 'Chennai', ditcrictcode: 'CN', stateid: 4, description: 'Gateway to South India' },
  { distrcitname: 'Coimbatore', ditcrictcode: 'CB', stateid: 4, description: 'Manchester of South India' },
  { distrcitname: 'Ahmedabad', ditcrictcode: 'AH', stateid: 5, description: 'Manchester of India' },
  { distrcitname: 'Surat', ditcrictcode: 'SR', stateid: 5, description: 'Diamond City' },
  { distrcitname: 'Jaipur', ditcrictcode: 'JP', stateid: 6, description: 'Pink City' },
  { distrcitname: 'Jodhpur', ditcrictcode: 'JD', stateid: 6, description: 'Blue City' },
  { distrcitname: 'Lucknow', ditcrictcode: 'LK', stateid: 7, description: 'City of Nawabs' },
  { distrcitname: 'Kanpur', ditcrictcode: 'KP', stateid: 7, description: 'Leather City' },
  { distrcitname: 'Kolkata', ditcrictcode: 'KL', stateid: 8, description: 'City of Joy' },
  { distrcitname: 'Howrah', ditcrictcode: 'HW', stateid: 8, description: 'Gateway of Bengal' },
  { distrcitname: 'Hyderabad', ditcrictcode: 'HD', stateid: 9, description: 'City of Pearls' },
  { distrcitname: 'Warangal', ditcrictcode: 'WG', stateid: 9, description: 'City of Lakes' },
  { distrcitname: 'Vijayawada', ditcrictcode: 'VJ', stateid: 10, description: 'Place of Victory' },
  { distrcitname: 'Visakhapatnam', ditcrictcode: 'VZ', stateid: 10, description: 'Jewel of the East Coast' },
  { distrcitname: 'Thiruvananthapuram', ditcrictcode: 'TV', stateid: 11, description: 'Evergreen City' },
  { distrcitname: 'Kochi', ditcrictcode: 'KC', stateid: 11, description: 'Queen of Arabian Sea' },
  { distrcitname: 'Chandigarh', ditcrictcode: 'CH', stateid: 12, description: 'City Beautiful' },
  { distrcitname: 'Amritsar', ditcrictcode: 'AM', stateid: 12, description: 'Golden City' },
  { distrcitname: 'Gurgaon', ditcrictcode: 'GG', stateid: 13, description: 'Millennium City' },
  { distrcitname: 'Faridabad', ditcrictcode: 'FD', stateid: 13, description: 'Industrial Hub' },
  { distrcitname: 'Bhopal', ditcrictcode: 'BH', stateid: 14, description: 'City of Lakes' },
  { distrcitname: 'Indore', ditcrictcode: 'IN', stateid: 14, description: 'Cleanest City' },
  { distrcitname: 'Patna', ditcrictcode: 'PT', stateid: 15, description: 'Ancient City' },
  { distrcitname: 'Gaya', ditcrictcode: 'GY', stateid: 15, description: 'Holy City' },
  { distrcitname: 'Bhubaneswar', ditcrictcode: 'BB', stateid: 16, description: 'Temple City' },
  { distrcitname: 'Cuttack', ditcrictcode: 'CT', stateid: 16, description: 'Silver City' },
  { distrcitname: 'Ranchi', ditcrictcode: 'RC', stateid: 17, description: 'City of Waterfalls' },
  { distrcitname: 'Jamshedpur', ditcrictcode: 'JS', stateid: 17, description: 'Steel City' }
];

// Function to seed districts
const seedDistricts = () => {
  try {
    console.log('🌱 Seeding districts...');
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM ldg_districts').get();
    if (existingCount.count > 0) {
      console.log(`✅ Districts already exist (${existingCount.count} districts found)`);
      return;
    }
    const stmt = db.prepare('INSERT INTO ldg_districts (distrcitname, ditcrictcode, stateid, description) VALUES (?, ?, ?, ?)');
    for (const district of sampleDistricts) {
      stmt.run(district.distrcitname, district.ditcrictcode, district.stateid, district.description);
      console.log(`✅ Added: ${district.distrcitname} (${district.ditcrictcode})`);
    }
    console.log(`🎉 Successfully seeded ${sampleDistricts.length} districts!`);
  } catch (error) {
    console.error('❌ Error seeding districts:', error);
  }
};

seedDistricts(); 