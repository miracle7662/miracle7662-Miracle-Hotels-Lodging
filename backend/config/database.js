const Database = require('better-sqlite3');
const path = require('path');

// Database file path - Store in D:\miresto folder
// const dbPath = path.join('D:', 'miresto', 'lodging.db');
const dbPath = path.join('D:', 'Database', 'lodging.db');
// Create database connection
const db = new Database(dbPath);

// Test database connection
const testConnection = () => {
  try {
    const result = db.prepare('SELECT 1 as test').get();
    console.log('✅ Database connection successful!');
    console.log(`📁 Database location: ${dbPath}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Initialize database (create tables when needed)
const initDatabase = () => {
  try {

    // Create countries table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_countries (
        countryid INTEGER PRIMARY KEY AUTOINCREMENT,
        countryname TEXT NOT NULL,
        countrycode TEXT NOT NULL UNIQUE,
        countrycapital TEXT,
        status INTEGER DEFAULT 1,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME 
      )
    `);

    // Create states table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_states (
        stateid INTEGER PRIMARY KEY AUTOINCREMENT,
        statename TEXT NOT NULL,
        statecode TEXT NOT NULL,
        statecapital TEXT,
        countryid INTEGER,
        status INTEGER DEFAULT 1,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME,
        FOREIGN KEY (countryid) REFERENCES ldg_countries (countryid)
      )
    `);

    // Create districts table (replacing cities)
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_districts (
        distrcitid INTEGER PRIMARY KEY AUTOINCREMENT,
        distrcitname TEXT NOT NULL,
        ditcrictcode TEXT NOT NULL,
        stateid INTEGER,
        description TEXT,
        status INTEGER DEFAULT 1,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME,
        FOREIGN KEY (stateid) REFERENCES ldg_states (stateid)
      )
    `);

    // Create zones table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_zones (
        zoneid INTEGER PRIMARY KEY AUTOINCREMENT,
        zonename TEXT NOT NULL,
        zonecode TEXT NOT NULL,
        districtid INTEGER,
        description TEXT,
        status INTEGER DEFAULT 1,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME,
        FOREIGN KEY (districtid) REFERENCES ldg_districts (distrcitid)
      )
    `);



    // Create superadmins table
    db.exec(`
      CREATE TABLE IF NOT EXISTS superadmins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create agents/admins table
    db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'agent',
        phone TEXT,
        address TEXT,
        country_id INTEGER,
        state_id INTEGER,
        district_id INTEGER,
        zone_id INTEGER,
        pan_number TEXT,
        aadhar_number TEXT,
        gst_number TEXT,
        status INTEGER DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES superadmins (id),
        FOREIGN KEY (country_id) REFERENCES ldg_countries (countryid),
        FOREIGN KEY (state_id) REFERENCES ldg_states (stateid),
        FOREIGN KEY (district_id) REFERENCES ldg_districts (distrcitid),
        FOREIGN KEY (zone_id) REFERENCES ldg_zones (zoneid)
      )
    `);

    // Create hotels/users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        hotel_name TEXT,
        phone TEXT,
        address TEXT,
        country_id INTEGER NULL,
        state_id INTEGER NULL,
        district_id INTEGER NULL,
        zone_id INTEGER NULL,
        status INTEGER DEFAULT 1,
        ldg_blocked INTEGER DEFAULT 0,
        created_by INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES agents (id),
        FOREIGN KEY (country_id) REFERENCES ldg_countries (countryid),
        FOREIGN KEY (state_id) REFERENCES ldg_states (stateid),
        FOREIGN KEY (district_id) REFERENCES ldg_districts (distrcitid),
        FOREIGN KEY (zone_id) REFERENCES ldg_zones (zoneid)
      )
    `);

    // Note: ldg_blocked column is already included in the mstldg_hotelmasters table definition

    // Create hotel type master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstlodgehoteltype (
        ldg_hoteltypeid INTEGER PRIMARY KEY AUTOINCREMENT,
        ldg_hotel_type TEXT(200),
        ldg_status INTEGER DEFAULT 1,
        ldg_created_by_id INTEGER,
        ldg_created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ldg_updated_by_id INTEGER,
        ldg_updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ldg_hotelid INTEGER,
        ldg_marketid INTEGER
      )
    `);

    // Create market master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstmarkets (
        ldg_marketid INTEGER PRIMARY KEY AUTOINCREMENT,
        ldg_market_name TEXT NOT NULL,
        ldg_status INTEGER DEFAULT 1,
        ldg_created_by_id INTEGER,
        ldg_created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ldg_updated_by_id INTEGER,
        ldg_updated_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create hotel master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS mstldg_hotelmasters (
        ldg_hotelid INTEGER PRIMARY KEY AUTOINCREMENT,
        ldg_hotel_name TEXT(200),
        ldg_marketid INTEGER,
        ldg_short_name TEXT(200),
        ldg_phone TEXT(40),
        ldg_email TEXT(200),
        ldg_fssai_no TEXT(200),
        ldg_trn_gstno TEXT(200),
        ldg_panno TEXT(200),
        ldg_website TEXT(200),
        ldg_address TEXT(400),
        ldg_stateid INTEGER,
        ldg_hoteltypeid INTEGER,
        ldg_HotelType TEXT(200),
        ldg_Shop_Act_Number TEXT(200),
        ldg_status INTEGER DEFAULT 1,
        ldg_blocked INTEGER DEFAULT 0,
        ldg_created_by_id INTEGER,
        ldg_created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ldg_updated_by_id INTEGER,
        ldg_updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        ldg_Masteruserid INTEGER
      )
    `);

    // Create block master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS mstldgblockmaster (
        blockid INTEGER PRIMARY KEY AUTOINCREMENT,
        block_name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        Created_by_id INTEGER,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        Updated_by_id INTEGER,
        Updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        Hotel_id INTEGER
      )
    `);

    // Create floor master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstfloormaster (
        floorid INTEGER PRIMARY KEY AUTOINCREMENT,
        floor_name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        Created_by_id INTEGER,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        Updated_by_id INTEGER,
        Updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        Hotel_id INTEGER
      )
    `);

    // Create guest type master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstguesttype (
        guesttypeid INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_type TEXT(200),
        status INTEGER DEFAULT 1,
        created_by_id INTEGER,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by_id INTEGER,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        hotelid INTEGER
      )
    `);

    // Create nationality master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstnationalitymaster (
        nationalityid INTEGER PRIMARY KEY AUTOINCREMENT,
        nationality TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        hotelid INTEGER,
        Created_by_id INTEGER,
        created_date TEXT,
        Updated_by_id INTEGER,
        Updated_date TEXT
      )
    `);

    // Create newspaper master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstnewspapermaster (
        newsid INTEGER PRIMARY KEY AUTOINCREMENT,
        paper_name TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        created_by_id INTEGER,
        created_date DATETIME,
        updated_by_id INTEGER,
        updated_date DATETIME,
        hotelid INTEGER
      )
    `);

    // Create feature master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstfeaturemaster (
        featureid INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_name TEXT NOT NULL,
        feature_Description TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        created_by_id INTEGER,
        created_date DATETIME,
        updated_by_id INTEGER,
        updated_date DATETIME,
        hotelid INTEGER
      )
    `);

    // Create fragment master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstfragmentmaster (
        fragmentid INTEGER PRIMARY KEY AUTOINCREMENT,
        fragment_name TEXT(200),
        status INTEGER DEFAULT 1,
        created_by_id INTEGER,
        created_date DATETIME,
        updated_by_id INTEGER,
        updated_date DATETIME,
        hotelid INTEGER
      )
    `);

    // Create city master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_citymaster (
        cityid INTEGER PRIMARY KEY AUTOINCREMENT,
        countryid INTEGER NOT NULL,
        stateid INTEGER NOT NULL,
        distrcitid INTEGER NOT NULL,
        cityname TEXT NOT NULL,
        status INTEGER DEFAULT 1,
        created_by_id INTEGER,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by_id INTEGER,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (countryid) REFERENCES ldg_countries(countryid),
        FOREIGN KEY (stateid) REFERENCES ldg_states(stateid),
        FOREIGN KEY (distrcitid) REFERENCES ldg_districts(distrcitid)
      )
    `);


    // Create company master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstcompanymaster (
        company_id INTEGER PRIMARY KEY,
        title TEXT,
        name TEXT,
        display_name TEXT,
        establishment_date TEXT,
        address TEXT,
        countryid INTEGER,
        stateid INTEGER,
        cityid INTEGER,
        phone1 TEXT,
        phone2 TEXT,
        gst_number TEXT,
        mobile TEXT,
        email TEXT,
        website TEXT,
        booking_contact_name TEXT,
        booking_contact_mobile TEXT,
        booking_contact_phone TEXT,
        corresponding_contact_name TEXT,
        corresponding_contact_mobile TEXT,
        corresponding_contact_phone TEXT,
        credit_limit TEXT,
        is_credit_allow INTEGER DEFAULT 0,
        is_company INTEGER DEFAULT 1,
        is_discount TEXT,
        discount_percent REAL,
        hotel_id INTEGER,
        created_by_id INTEGER,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by_id INTEGER,
        updated_date DATETIME
      )
    `);

    // Create guest master table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ldg_mstguestmaster (
        guest_id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_name TEXT NOT NULL,
        organization TEXT NOT NULL,
        address TEXT NOT NULL,
        countryid INTEGER,
        stateid INTEGER,
        cityid INTEGER,
        company_id INTEGER,
        occupation TEXT NOT NULL,
        postHeld TEXT NOT NULL,
        phone1 TEXT NOT NULL,
        phone2 TEXT NOT NULL,
        mobile_no TEXT NOT NULL,
        office_mail TEXT NOT NULL,
        personal_mail TEXT NOT NULL,
        website TEXT NOT NULL,
        purpose TEXT NOT NULL,
        arrivalFrom TEXT NOT NULL,
        departureTo TEXT NOT NULL,
        guesttypeid INTEGER,
        gender TEXT NOT NULL,
        nationalityid INTEGER,
        birthday TEXT NOT NULL,
        anniversary TEXT NOT NULL,
        creditAllowed INTEGER DEFAULT 0,
        isDiscountAllowed INTEGER DEFAULT 0,
        discountPercent TEXT NOT NULL,
        personalInstructions TEXT NOT NULL,
        adhar_no TEXT NOT NULL,
        pan_no TEXT NOT NULL,
        driving_license TEXT NOT NULL,
        Other TEXT,
        discount TEXT NOT NULL,
        gst_number TEXT,
        hotelid INTEGER,
        status INTEGER DEFAULT 1,
        created_by_id INTEGER,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by_id INTEGER,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (countryid) REFERENCES ldg_countries (countryid),
        FOREIGN KEY (stateid) REFERENCES ldg_states (stateid),
        FOREIGN KEY (cityid) REFERENCES ldg_citymaster (cityid),
        FOREIGN KEY (company_id) REFERENCES ldg_mstcompanymaster (company_id),
        FOREIGN KEY (guesttypeid) REFERENCES ldg_mstguesttype (guesttypeid),
        FOREIGN KEY (nationalityid) REFERENCES ldg_mstnationalitymaster (nationalityid),
        FOREIGN KEY (hotelid) REFERENCES hotels (id)
      )
    `);

    
    console.log('✅ Master tables and user tables created successfully!');
    console.log(`📁 Database file: ${dbPath}`);
  } catch (error) {
    console.error('❌ Error creating master tables:', error);
  }
};

module.exports = { db, testConnection, initDatabase };