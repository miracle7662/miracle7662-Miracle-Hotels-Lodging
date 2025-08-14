const { db } = require('../config/database');

console.log('Starting city master table migration...');

try {
  // Disable foreign key constraints temporarily
  console.log('Disabling foreign key constraints...');
  db.exec('PRAGMA foreign_keys = OFF');
  
  // Drop the existing table
  console.log('Dropping existing ldg_citymaster table...');
  db.exec('DROP TABLE IF EXISTS ldg_citymaster');
  
  // Create the new table with correct schema
  console.log('Creating new ldg_citymaster table...');
  db.exec(`
    CREATE TABLE ldg_citymaster (
      cityid INTEGER PRIMARY KEY AUTOINCREMENT,
      countryid INTEGER NOT NULL,
      stateid INTEGER NOT NULL,
      districtid INTEGER NOT NULL,
      cityname TEXT NOT NULL,
      status INTEGER DEFAULT 1,
      created_by_id INTEGER,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_by_id INTEGER,
      updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (countryid) REFERENCES ldg_countries(countryid),
      FOREIGN KEY (stateid) REFERENCES ldg_states(stateid),
      FOREIGN KEY (districtid) REFERENCES ldg_districts(distrcitid)
    )
  `);
  
  // Re-enable foreign key constraints
  console.log('Re-enabling foreign key constraints...');
  db.exec('PRAGMA foreign_keys = ON');
  
  console.log('✅ City master table migration completed successfully!');
  
  // Test the table structure
  const tableInfo = db.prepare("PRAGMA table_info(ldg_citymaster)").all();
  console.log('Table structure:');
  tableInfo.forEach(column => {
    console.log(`  ${column.name} (${column.type})`);
  });
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  // Re-enable foreign key constraints even if migration fails
  try {
    db.exec('PRAGMA foreign_keys = ON');
  } catch (e) {
    console.error('Failed to re-enable foreign key constraints:', e);
  }
}
