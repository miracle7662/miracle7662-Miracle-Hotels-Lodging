const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'data', 'lodging.db');

console.log('🔄 Updating blocked column for existing hotels...');

try {
  // Connect to database
  const db = new Database(dbPath);
  console.log('✅ Connected to database');

  // Check if ldg_blocked column exists in mstldg_hotelmasters
  const tableInfo = db.prepare("PRAGMA table_info(mstldg_hotelmasters)").all();
  const hasBlockedColumn = tableInfo.some(col => col.name === 'ldg_blocked');
  
  if (!hasBlockedColumn) {
    console.log('⚠️  ldg_blocked column not found, adding it...');
    db.exec('ALTER TABLE mstldg_hotelmasters ADD COLUMN ldg_blocked INTEGER DEFAULT 0');
    console.log('✅ Added ldg_blocked column to mstldg_hotelmasters');
  } else {
    console.log('✅ ldg_blocked column already exists in mstldg_hotelmasters');
  }

  // Check if ldg_blocked column exists in hotels table
  const hotelsTableInfo = db.prepare("PRAGMA table_info(hotels)").all();
  const hotelsHasBlockedColumn = hotelsTableInfo.some(col => col.name === 'ldg_blocked');
  
  if (!hotelsHasBlockedColumn) {
    console.log('⚠️  ldg_blocked column not found in hotels table, adding it...');
    db.exec('ALTER TABLE hotels ADD COLUMN ldg_blocked INTEGER DEFAULT 0');
    console.log('✅ Added ldg_blocked column to hotels');
  } else {
    console.log('✅ ldg_blocked column already exists in hotels');
  }

  // Update existing records to have ldg_blocked = 0 (active)
  const updateHotelMasters = db.prepare('UPDATE mstldg_hotelmasters SET ldg_blocked = 0 WHERE ldg_blocked IS NULL');
  const hotelMastersResult = updateHotelMasters.run();
  console.log(`✅ Updated ${hotelMastersResult.changes} hotel master records`);

  const updateHotels = db.prepare('UPDATE hotels SET ldg_blocked = 0 WHERE ldg_blocked IS NULL');
  const hotelsResult = updateHotels.run();
  console.log(`✅ Updated ${hotelsResult.changes} hotel login records`);

  // Show current status
  const hotelCount = db.prepare('SELECT COUNT(*) as count FROM mstldg_hotelmasters').get();
  const blockedCount = db.prepare('SELECT COUNT(*) as count FROM mstldg_hotelmasters WHERE ldg_blocked = 1').get();
  
  console.log(`📊 Total hotels: ${hotelCount.count}`);
  console.log(`📊 Blocked hotels: ${blockedCount.count}`);
  console.log(`📊 Active hotels: ${hotelCount.count - blockedCount.count}`);

  db.close();
  console.log('✅ Database connection closed');
  console.log('🎉 Update completed successfully!');

} catch (error) {
  console.error('❌ Error updating blocked column:', error);
  process.exit(1);
} 