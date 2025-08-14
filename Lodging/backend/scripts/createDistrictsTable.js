const db = require('../config/database');

const createDistrictsTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS districts (
      districtid INTEGER PRIMARY KEY AUTOINCREMENT,
      district_name TEXT NOT NULL,
      districtcode TEXT NOT NULL UNIQUE,
      stateid INTEGER NOT NULL,
      description TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (stateid) REFERENCES states(stateid)
    )
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Error creating districts table:', err);
    } else {
      console.log('Districts table created successfully');
    }
  });
};

// Run the script
createDistrictsTable();
