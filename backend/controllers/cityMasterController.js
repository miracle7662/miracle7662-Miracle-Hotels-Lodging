// const { db } = require('../config/database');

// // Get all cities
// const getAllCities = (req, res) => {
//   try {
//     const cities = db.prepare(`
//       SELECT 
//         c.cityid,
//         c.countryid,
//         c.stateid,
//         c.distrcitid,
//         c.cityname,
//         c.status,
//         c.created_by_id,
//         c.created_date,
//         c.updated_by_id,
//         c.updated_date,
//         co.countryname AS country_name,
//         s.statename AS state_name,
//         d.distrcitname AS district_name
//       FROM ldg_citymaster c
//       LEFT JOIN ldg_countries co ON c.countryid = co.countryid AND co.status = 1
//       LEFT JOIN ldg_states s ON c.stateid = s.stateid AND s.status = 1
//       LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid AND d.status = 1
//       WHERE c.status = 1
//       ORDER BY c.cityname
//     `).all();
//     res.json(cities);
//   } catch (error) {
//     console.error('Error fetching cities:', error);
//     res.status(500).json({ error: 'Failed to fetch cities', details: error.message });
//   }
// };

// // Get single city by ID
// const getCityById = (req, res) => {
//   const { id } = req.params;
//   try {
//     const city = db.prepare(`
//       SELECT 
//         c.cityid,
//         c.countryid,
//         c.stateid,
//         c.distrcitid,
//         c.cityname,
//         c.status,
//         c.created_by_id,
//         c.created_date,
//         c.updated_by_id,
//         c.updated_date,
//         co.countryname AS country_name,
//         s.statename AS state_name,
//         d.distrcitname AS district_name
//       FROM ldg_citymaster c
//       LEFT JOIN ldg_countries co ON c.countryid = co.countryid AND co.status = 1
//       LEFT JOIN ldg_states s ON c.stateid = s.stateid AND s.status = 1
//       LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid AND d.status = 1
//       WHERE c.cityid = ? AND c.status = 1
//     `).get(id);
//     if (city) {
//       res.json(city);
//     } else {
//       res.status(404).json({ error: 'City not found or inactive' });
//     }
//   } catch (error) {
//     console.error('Error fetching city:', error);
//     res.status(500).json({ error: 'Failed to fetch city', details: error.message });
//   }
// };

// // Create city
// const createCity = (req, res) => {
//   const { cityname, countryid, stateid, distrcitid, status } = req.body;
//   if (!cityname || !countryid || !stateid || !distrcitid) {
//     return res.status(400).json({ error: 'City name, country ID, state ID, and district ID are required' });
//   }
//   try {
//     const country = db.prepare('SELECT countryid FROM ldg_countries WHERE countryid = ? AND status = 1').get(countryid);
//     const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND countryid = ? AND status = 1').get(stateid, countryid);
//     const district = db.prepare('SELECT distrcitid FROM ldg_districts WHERE distrcitid = ? AND stateid = ? AND status = 1').get(distrcitid, stateid);
//     if (!country) return res.status(400).json({ error: 'Invalid country ID' });
//     if (!state) return res.status(400).json({ error: 'Invalid state ID' });
//     if (!district) return res.status(400).json({ error: 'Invalid district ID' });

//     const stmt = db.prepare(`
//       INSERT INTO ldg_citymaster (cityname, countryid, stateid, distrcitid, status, created_by_id, created_date)
//       VALUES (?, ?, ?, ?, ?, NULL, CURRENT_TIMESTAMP)
//     `);
//     const result = stmt.run(cityname, countryid, stateid, distrcitid, status || 1);
//     const newCity = db.prepare(`
//       SELECT 
//         c.cityid,
//         c.countryid,
//         c.stateid,
//         c.distrcitid,
//         c.cityname,
//         c.status,
//         c.created_by_id,
//         c.created_date,
//         c.updated_by_id,
//         c.updated_date,
//         co.countryname AS country_name,
//         s.statename AS state_name,
//         d.distrcitname AS district_name
//       FROM ldg_citymaster c
//       LEFT JOIN ldg_countries co ON c.countryid = co.countryid AND co.status = 1
//       LEFT JOIN ldg_states s ON c.stateid = s.stateid AND s.status = 1
//       LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid AND d.status = 1
//       WHERE c.cityid = ?
//     `).get(result.lastInsertRowid);
//     res.status(201).json({ message: 'City created successfully!', city: newCity });
//   } catch (error) {
//     console.error('Error creating city:', error);
//     res.status(500).json({ error: 'Failed to create city', details: error.message });
//   }
// };

// // Update city
// const updateCity = (req, res) => {
//   const { cityname, countryid, stateid, distrcitid, status } = req.body;
//   const { id } = req.params;
//   if (!cityname || !countryid || !stateid || !distrcitid) {
//     return res.status(400).json({ error: 'City name, country ID, state ID, and district ID are required' });
//   }
//   try {
//     const country = db.prepare('SELECT countryid FROM ldg_countries WHERE countryid = ? AND status = 1').get(countryid);
//     const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND countryid = ? AND status = 1').get(stateid, countryid);
//     const district = db.prepare('SELECT distrcitid FROM ldg_districts WHERE distrcitid = ? AND stateid = ? AND status = 1').get(distrcitid, stateid);
//     if (!country) return res.status(400).json({ error: 'Invalid country ID' });
//     if (!state) return res.status(400).json({ error: 'Invalid state ID' });
//     if (!district) return res.status(400).json({ error: 'Invalid district ID' });

//     const stmt = db.prepare(`
//       UPDATE ldg_citymaster
//       SET cityname = ?, countryid = ?, stateid = ?, distrcitid = ?, status = ?, updated_by_id = NULL, updated_date = CURRENT_TIMESTAMP
//       WHERE cityid = ? AND status = 1
//     `);
//     const result = stmt.run(cityname, countryid, stateid, distrcitid, status || 1, id);
//     if (result.changes > 0) {
//       const updatedCity = db.prepare(`
//         SELECT 
//           c.cityid,
//           c.countryid,
//           c.stateid,
//           c.distrcitid,
//           c.cityname,
//           c.status,
//           c.created_by_id,
//           c.created_date,
//           c.updated_by_id,
//           c.updated_date,
//           co.countryname AS country_name,
//           s.statename AS state_name,
//           d.distrcitname AS district_name
//         FROM ldg_citymaster c
//         LEFT JOIN ldg_countries co ON c.countryid = co.countryid AND co.status = 1
//         LEFT JOIN ldg_states s ON c.stateid = s.stateid AND s.status = 1
//         LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid AND d.status = 1
//         WHERE c.cityid = ?
//       `).get(id);
//       res.json({ message: 'City updated successfully!', city: updatedCity });
//     } else {
//       res.status(404).json({ error: 'City not found or inactive' });
//     }
//   } catch (error) {
//     console.error('Error updating city:', error);
//     res.status(500).json({ error: 'Failed to update city', details: error.message });
//   }
// };

// // Get cities by state id
// const getCitiesByState = (req, res) => {
//   const { stateId } = req.params;
//   try {
//     const cities = db.prepare(`
//       SELECT 
//         c.cityid,
//         c.cityname,
//         c.countryid,
//         c.stateid,
//         c.distrcitid,
//         c.status,
//         co.countryname AS country_name,
//         s.statename AS state_name,
//         d.distrcitname AS district_name
//       FROM ldg_citymaster c
//       LEFT JOIN ldg_countries co ON c.countryid = co.countryid AND co.status = 1
//       LEFT JOIN ldg_states s ON c.stateid = s.stateid AND s.status = 1
//       LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid AND d.status = 1
//       WHERE c.stateid = ? AND c.status = 1
//       ORDER BY c.cityname
//     `).all(stateId);
//     res.json(cities);
//   } catch (error) {
//     console.error('Error fetching cities by state:', error);
//     res.status(500).json({ error: 'Failed to fetch cities by state', details: error.message });
//   }
// };

// // Get cities by state and district
// const getCitiesByStateAndDistrict = (req, res) => {
//   const { stateId, distrcitid } = req.params;
//   try {
//     const cities = db.prepare(`
//       SELECT 
//         c.cityid,
//         c.cityname,
//         c.countryid,
//         c.stateid,
//         c.distrcitid,
//         c.status,
//         co.countryname AS country_name,
//         s.statename AS state_name,
//         d.distrcitname AS district_name
//       FROM ldg_citymaster c
//       LEFT JOIN ldg_countries co ON c.countryid = co.countryid AND co.status = 1
//       LEFT JOIN ldg_states s ON c.stateid = s.stateid AND s.status = 1
//       LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid AND d.status = 1
//       WHERE c.stateid = ? AND c.distrcitid = ? AND c.status = 1
//       ORDER BY c.cityname
//     `).all(stateId, distrcitid);
//     res.json(cities);
//   } catch (error) {
//     console.error('Error fetching cities by state and district:', error);
//     res.status(500).json({ error: 'Failed to fetch cities by state and district', details: error.message });
//   }
// };

// // Delete city (soft delete)
// const deleteCity = (req, res) => {
//   const { id } = req.params;
//   try {
//     const stmt = db.prepare(`
//       UPDATE ldg_citymaster
//       SET status = 0, updated_by_id = NULL, updated_date = CURRENT_TIMESTAMP
//       WHERE cityid = ? AND status = 1
//     `);
//     const result = stmt.run(id);
//     if (result.changes > 0) {
//       res.json({ message: 'City deleted successfully!' });
//     } else {
//       res.status(404).json({ error: 'City not found or already inactive' });
//     }
//   } catch (error) {
//     console.error('Error deleting city:', error);
//     res.status(500).json({ error: 'Failed to delete city', details: error.message });
//   }
// };

// module.exports = {
//   getAllCities,
//   getCityById,
//   getCitiesByState,
//   getCitiesByStateAndDistrict,
//   createCity,
//   updateCity,
//   deleteCity
// };



const { db } = require('../config/database');

// Get all cities
const getAllCities = (req, res) => {
  try {
    const cities = db.prepare(`
      SELECT 
        c.cityid,
        c.countryid,
        c.stateid,
        c.distrcitid,
        c.cityname,
        c.status,
        c.created_by_id,
        c.created_date,
        c.updated_by_id,
        c.updated_date,
        co.countryname AS country_name,
        s.statename AS state_name,
        d.distrcitname AS district_name
      FROM ldg_citymaster c
      LEFT JOIN ldg_countries co ON c.countryid = co.countryid
      LEFT JOIN ldg_states s ON c.stateid = s.stateid
      LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid
      WHERE c.status = 1
      ORDER BY c.cityname
    `).all();
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities', details: error.message });
  }
};

// Get single city by ID
const getCityById = (req, res) => {
  const { id } = req.params;
  try {
    const city = db.prepare(`
      SELECT 
        c.cityid,
        c.countryid,
        c.stateid,
        c.distrcitid,
        c.cityname,
        c.status,
        c.created_by_id,
        c.created_date,
        c.updated_by_id,
        c.updated_date,
        co.countryname AS country_name,
        s.statename AS state_name,
        d.distrcitname AS district_name
      FROM ldg_citymaster c
      LEFT JOIN ldg_countries co ON c.countryid = co.countryid
      LEFT JOIN ldg_states s ON c.stateid = s.stateid
      LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid
      WHERE c.cityid = ? AND c.status = 1
    `).get(id);
    if (city) {
      res.json(city);
    } else {
      res.status(404).json({ error: 'City not found or inactive' });
    }
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ error: 'Failed to fetch city', details: error.message });
  }
};

// Create city
const createCity = (req, res) => {
  const { cityname, countryid, stateid, distrcitid, status } = req.body;
  if (!cityname || !countryid || !stateid || !distrcitid) {
    return res.status(400).json({ error: 'City name, country ID, state ID, and district ID are required' });
  }
  try {
    // Validate foreign keys
    const country = db.prepare('SELECT countryid FROM ldg_countries WHERE countryid = ? AND status = 1').get(countryid);
    const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND countryid = ? AND status = 1').get(stateid, countryid);
    const district = db.prepare('SELECT distrcitid FROM ldg_districts WHERE distrcitid = ? AND stateid = ? AND status = 1').get(distrcitid, stateid);
    if (!country) return res.status(400).json({ error: 'Invalid country ID' });
    if (!state) return res.status(400).json({ error: 'Invalid state ID' });
    if (!district) return res.status(400).json({ error: 'Invalid district ID' });

    const stmt = db.prepare(`
      INSERT INTO ldg_citymaster (cityname, countryid, stateid, distrcitid, status, created_by_id, created_date)
      VALUES (?, ?, ?, ?, ?, NULL, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(cityname, countryid, stateid, distrcitid, status || 1);
    const newCity = db.prepare(`
      SELECT 
        c.cityid,
        c.countryid,
        c.stateid,
        c.distrcitid,
        c.cityname,
        c.status,
        c.created_by_id,
        c.created_date,
        c.updated_by_id,
        c.updated_date,
        co.countryname AS country_name,
        s.statename AS state_name,
        d.distrcitname AS district_name
      FROM ldg_citymaster c
      LEFT JOIN ldg_countries co ON c.countryid = co.countryid
      LEFT JOIN ldg_states s ON c.stateid = s.stateid
      LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid
      WHERE c.cityid = ?
    `).get(result.lastInsertRowid);
    res.status(201).json({ message: 'City created successfully!', city: newCity });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ error: 'Failed to create city', details: error.message });
  }
};

// Update city
const updateCity = (req, res) => {
  const { cityname, countryid, stateid, distrcitid, status } = req.body;
  const { id } = req.params;
  if (!cityname || !countryid || !stateid || !distrcitid) {
    return res.status(400).json({ error: 'City name, country ID, state ID, and district ID are required' });
  }
  try {
    // Validate foreign keys
    const country = db.prepare('SELECT countryid FROM ldg_countries WHERE countryid = ? AND status = 1').get(countryid);
    const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND countryid = ? AND status = 1').get(stateid, countryid);
    const district = db.prepare('SELECT distrcitid FROM ldg_districts WHERE distrcitid = ? AND stateid = ? AND status = 1').get(distrcitid, stateid);
    if (!country) return res.status(400).json({ error: 'Invalid country ID' });
    if (!state) return res.status(400).json({ error: 'Invalid state ID' });
    if (!district) return res.status(400).json({ error: 'Invalid district ID' });

    const stmt = db.prepare(`
      UPDATE ldg_citymaster
      SET cityname = ?, countryid = ?, stateid = ?, distrcitid = ?, status = ?, updated_by_id = NULL, updated_date = CURRENT_TIMESTAMP
      WHERE cityid = ? AND status = 1
    `);
    const result = stmt.run(cityname, countryid, stateid, distrcitid, status || 1, id);
    if (result.changes > 0) {
      const updatedCity = db.prepare(`
        SELECT 
          c.cityid,
          c.countryid,
          c.stateid,
          c.distrcitid,
          c.cityname,
          c.status,
          c.created_by_id,
          c.created_date,
          c.updated_by_id,
          c.updated_date,
          co.countryname AS country_name,
          s.statename AS state_name,
          d.distrcitname AS district_name
        FROM ldg_citymaster c
        LEFT JOIN ldg_countries co ON c.countryid = co.countryid
        LEFT JOIN ldg_states s ON c.stateid = s.stateid
        LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid
        WHERE c.cityid = ?
      `).get(id);
      res.json({ message: 'City updated successfully!', city: updatedCity });
    } else {
      res.status(404).json({ error: 'City not found or inactive' });
    }
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ error: 'Failed to update city', details: error.message });
  }
};

// Get cities by state id
const getCitiesByState = (req, res) => {
  const { stateId } = req.params;
  try {
    const cities = db.prepare(`
      SELECT 
        c.cityid,
        c.cityname,
        c.countryid,
        c.stateid,
        c.distrcitid,
        c.status,
        co.countryname AS country_name,
        s.statename AS state_name,
        d.distrcitname AS district_name
      FROM ldg_citymaster c
      LEFT JOIN ldg_countries co ON c.countryid = co.countryid
      LEFT JOIN ldg_states s ON c.stateid = s.stateid
      LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid
      WHERE c.stateid = ? AND c.status = 1
      ORDER BY c.cityname
    `).all(stateId);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities by state:', error);
    res.status(500).json({ error: 'Failed to fetch cities by state', details: error.message });
  }
};

// Get cities by state and district
const getCitiesByStateAndDistrict = (req, res) => {
  const { stateId, districtId } = req.params;
  try {
    const cities = db.prepare(`
      SELECT 
        c.cityid,
        c.cityname,
        c.countryid,
        c.stateid,
        c.distrcitid,
        c.status,
        co.countryname AS country_name,
        s.statename AS state_name,
        d.distrcitname AS district_name
      FROM ldg_citymaster c
      LEFT JOIN ldg_countries co ON c.countryid = co.countryid
      LEFT JOIN ldg_states s ON c.stateid = s.stateid
      LEFT JOIN ldg_districts d ON c.distrcitid = d.distrcitid
      WHERE c.stateid = ? AND c.distrcitid = ? AND c.status = 1
      ORDER BY c.cityname
    `).all(stateId, districtId);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities by state and district:', error);
    res.status(500).json({ error: 'Failed to fetch cities by state and district', details: error.message });
  }
};

// Delete city (soft delete)
const deleteCity = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare(`
      UPDATE ldg_citymaster
      SET status = 0, updated_by_id = NULL, updated_date = CURRENT_TIMESTAMP
      WHERE cityid = ? AND status = 1
    `);
    const result = stmt.run(id);
    if (result.changes > 0) {
      res.json({ message: 'City deleted successfully!' });
    } else {
      res.status(404).json({ error: 'City not found or already inactive' });
    }
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ error: 'Failed to delete city', details: error.message });
  }
};

module.exports = {
  getAllCities,
  getCityById,
  getCitiesByState,
  getCitiesByStateAndDistrict,
  createCity,
  updateCity,
  deleteCity
};