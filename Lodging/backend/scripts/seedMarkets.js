const { db } = require('../config/database');

// Sample market data
const sampleMarkets = [
  { ldg_market_name: 'North America' },
  { ldg_market_name: 'Europe' },
  { ldg_market_name: 'Asia Pacific' },
  { ldg_market_name: 'Middle East' },
  { ldg_market_name: 'Latin America' },
  { ldg_market_name: 'Africa' },
  { ldg_market_name: 'Caribbean' },
  { ldg_market_name: 'Oceania' },
  { ldg_market_name: 'Central America' },
  { ldg_market_name: 'South America' }
];

// Clear existing data and insert new data
const seedMarkets = () => {
  try {
    console.log('Starting market seeding...');
    
    // Clear existing data
    db.prepare('DELETE FROM ldg_mstmarkets').run();
    console.log('Cleared existing market data');
    
    // Insert sample markets
    const insertStmt = db.prepare(`
      INSERT INTO ldg_mstmarkets (ldg_market_name)
      VALUES (?)
    `);
    
    sampleMarkets.forEach(market => {
      insertStmt.run(market.ldg_market_name);
    });
    
    console.log(`Successfully seeded ${sampleMarkets.length} markets`);
    
    // Verify the data
    const count = db.prepare('SELECT COUNT(*) as count FROM ldg_mstmarkets').get();
    console.log(`Total markets in database: ${count.count}`);
    
    // Show the seeded data
    const markets = db.prepare('SELECT * FROM ldg_mstmarkets ORDER BY ldg_marketid').all();
    console.log('Seeded markets:');
    markets.forEach(market => {
      console.log(`- ${market.ldg_marketid}: ${market.ldg_market_name}`);
    });
    
  } catch (error) {
    console.error('Error seeding markets:', error);
  }
};

// Run the seeding
seedMarkets(); 