const { db } = require('../config/database');

// Sample countries data
const sampleCountries = [
  { countryname: 'India', countrycode: 'IN', countrycapital: 'New Delhi' },
  { countryname: 'United States', countrycode: 'US', countrycapital: 'Washington D.C.' },
  { countryname: 'United Kingdom', countrycode: 'UK', countrycapital: 'London' },
  { countryname: 'Canada', countrycode: 'CA', countrycapital: 'Ottawa' },
  { countryname: 'Australia', countrycode: 'AU', countrycapital: 'Canberra' },
  { countryname: 'Germany', countrycode: 'DE', countrycapital: 'Berlin' },
  { countryname: 'France', countrycode: 'FR', countrycapital: 'Paris' },
  { countryname: 'Japan', countrycode: 'JP', countrycapital: 'Tokyo' },
  { countryname: 'Brazil', countrycode: 'BR', countrycapital: 'Brasília' },
  { countryname: 'South Africa', countrycode: 'ZA', countrycapital: 'Pretoria' }
];

// Function to seed countries
const seedCountries = () => {
  try {
    console.log('🌱 Seeding countries...');
    
    // Check if countries already exist
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM ldg_countries').get();
    
    if (existingCount.count > 0) {
      console.log(`✅ Countries already exist (${existingCount.count} countries found)`);
      return;
    }
    
    // Insert sample countries
    const stmt = db.prepare('INSERT INTO ldg_countries (countryname, countrycode, countrycapital) VALUES (?, ?, ?)');
    
    for (const country of sampleCountries) {
      stmt.run(country.countryname, country.countrycode, country.countrycapital);
      console.log(`✅ Added: ${country.countryname} (${country.countrycode})`);
    }
    
    console.log(`🎉 Successfully seeded ${sampleCountries.length} countries!`);
  } catch (error) {
    console.error('❌ Error seeding countries:', error);
  }
};

// Run the seeding
seedCountries(); 