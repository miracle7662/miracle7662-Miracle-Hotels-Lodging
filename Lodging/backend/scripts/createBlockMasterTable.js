const { db } = require('../config/database');

const createBlockMasterTable = () => {
  try {
    // Create the block master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS mstldgblockmaster (
        blockid       INTEGER PRIMARY KEY AUTOINCREMENT,
        block_name    TEXT    NOT NULL,
        display_name  TEXT    NOT NULL,
        status        INTEGER DEFAULT 1,
        Created_by_id INTEGER,
        created_date  TEXT,
        Updated_by_id INTEGER,
        Updated_date  TEXT,
        Hotel_id      INTEGER
      );
    `);

    console.log('✅ Block Master table created successfully!');
    
    // Insert some sample data
    const sampleBlocks = [
      {
        block_name: 'Main Block',
        display_name: 'Main Building',
        Hotel_id: 1,
        created_date: new Date().toISOString()
      },
      {
        block_name: 'Annex Block',
        display_name: 'Annex Building',
        Hotel_id: 1,
        created_date: new Date().toISOString()
      },
      {
        block_name: 'Garden Block',
        display_name: 'Garden Wing',
        Hotel_id: 1,
        created_date: new Date().toISOString()
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO mstldgblockmaster (block_name, display_name, Hotel_id, created_date)
      VALUES (?, ?, ?, ?)
    `);

    sampleBlocks.forEach(block => {
      insertStmt.run(block.block_name, block.display_name, block.Hotel_id, block.created_date);
    });

    console.log('✅ Sample block data inserted successfully!');
    console.log('📊 Block Master table is ready for use.');
    
  } catch (error) {
    console.error('❌ Error creating Block Master table:', error);
  }
};

// Run the script if called directly
if (require.main === module) {
  createBlockMasterTable();
}

module.exports = { createBlockMasterTable }; 