// const { db } = require('../config/database');

// // Get all districts
// const getAllDistricts = (req, res) => {
//   try {
//     const districts = db.prepare(`
//       SELECT 
//         d.districtid,
//         d.districtname,
//         d.districtcode,
//         d.stateid,
//         d.description,
//         d.status,
//         d.created_date,
//         s.statename as state_name,
//         c.countryname as country_name 
//       FROM ldg_districts d 
//       LEFT JOIN ldg_states s ON d.stateid = s.stateid 
//       LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
//       WHERE d.status = 1 
//       ORDER BY d.districtname
//     `).all();
//     console.log('Fetched districts:', districts);
//     res.json(districts);
//   } catch (error) {
//     console.error('Error fetching districts:', error);
//     res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
//   }
// };

// // Get districts by state
// const getDistrictsByState = (req, res) => {
//   const { stateId } = req.params;
//   if (!stateId) {
//     return res.status(400).json({ error: 'State ID is required' });
//   }
//   try {
//     const districts = db.prepare(`
//       SELECT 
//         d.districtid,
//         d.districtname,
//         d.districtcode,
//         d.stateid,
//         d.description,
//         d.status,
//         d.created_date,
//         s.statename as state_name 
//       FROM ldg_districts d 
//       LEFT JOIN ldg_states s ON d.stateid = s.stateid 
//       WHERE d.stateid = ? AND d.status = 1 
//       ORDER BY d.districtname
//     `).all(stateId);
//     res.json(districts);
//   } catch (error) {
//     console.error('Error fetching districts by state:', error);
//     res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
//   }
// };

// // Get single district by ID
// const getDistrictById = (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     return res.status(400).json({ error: 'District ID is required' });
//   }
//   try {
//     const district = db.prepare(`
//       SELECT 
//         d.districtid,
//         d.districtname,
//         d.districtcode,
//         d.stateid,
//         d.description,
//         d.status,
//         d.created_date,
//         s.statename as state_name,
//         c.countryname as country_name 
//       FROM ldg_districts d 
//       LEFT JOIN ldg_states s ON d.stateid = s.stateid 
//       LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
//       WHERE d.districtid = ? AND d.status = 1
//     `).get(id);
    
//     if (district) {
//       res.json(district);
//     } else {
//       res.status(404).json({ error: 'District not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching district:', error);
//     res.status(500).json({ error: 'Failed to fetch district', details: error.message });
//   }
// };

// // Create new district
// const createDistrict = (req, res) => {
//   const { districtname, districtcode, stateid, description } = req.body;
  
//   if (!districtname || !districtcode || !stateid) {
//     return res.status(400).json({ error: 'District name, code, and state ID are required' });
//   }

//   try {
//     // Verify stateid exists and is active
//     const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND status = 1').get(stateid);
//     if (!state) {
//       return res.status(400).json({ error: 'Invalid or inactive state ID' });
//     }

//     const stmt = db.prepare(`
//       INSERT INTO ldg_districts (districtname, districtcode, stateid, description, created_date) 
//       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
//     `);
//     const result = stmt.run(districtname, districtcode, stateid, description || null);
    
//     const newDistrict = db.prepare(`
//       SELECT 
//         d.districtid,
//         d.districtname,
//         d.districtcode,
//         d.stateid,
//         d.description,
//         d.status,
//         d.created_date,
//         s.statename as state_name,
//         c.countryname as country_name 
//       FROM ldg_districts d 
//       LEFT JOIN ldg_states s ON d.stateid = s.stateid 
//       LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
//       WHERE d.districtid = ?
//     `).get(result.lastInsertRowid);
    
//     console.log('New district created:', newDistrict);
//     res.status(201).json({
//       message: 'District created successfully!',
//       district: newDistrict
//     });
//   } catch (error) {
//     console.error('Error creating district:', error);
//     res.status(500).json({ error: 'Failed to create district', details: error.message });
//   }
// };

// // Update district
// const updateDistrict = (req, res) => {
//   const { districtname, districtcode, stateid, description } = req.body;
//   const { id } = req.params;

//   if (!districtname || !districtcode || !stateid) {
//     return res.status(400).json({ error: 'District name, code, and state ID are required' });
//   }

//   try {
//     // Verify stateid exists and is active
//     const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND status = 1').get(stateid);
//     if (!state) {
//       return res.status(400).json({ error: 'Invalid or inactive state ID' });
//     }

//     const stmt = db.prepare(`
//       UPDATE ldg_districts 
//       SET districtname = ?, districtcode = ?, stateid = ?, description = ?, updated_date = CURRENT_TIMESTAMP 
//       WHERE districtid = ? AND status = 1
//     `);
//     const result = stmt.run(districtname, districtcode, stateid, description || null, id);
    
//     if (result.changes > 0) {
//       const updatedDistrict = db.prepare(`
//         SELECT 
//           d.districtid,
//           d.districtname,
//           d.districtcode,
//           d.stateid,
//           d.description,
//           d.status,
//           d.created_date,
//           s.statename as state_name,
//           c.countryname as country_name 
//         FROM ldg_districts d 
//         LEFT JOIN ldg_states s ON d.stateid = s.stateid 
//         LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
//         WHERE d.districtid = ?
//       `).get(id);
//       console.log('Updated district:', updatedDistrict);
//       res.json({ message: 'District updated successfully!', district: updatedDistrict });
//     } else {
//       res.status(404).json({ error: 'District not found or inactive' });
//     }
//   } catch (error) {
//     console.error('Error updating district:', error);
//     res.status(500).json({ error: 'Failed to update district', details: error.message });
//   }
// };

// // Delete district (soft delete)
// const deleteDistrict = (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     return res.status(400).json({ error: 'District ID is required' });
//   }
//   try {
//     const stmt = db.prepare('UPDATE ldg_districts SET status = 0, updated_date = CURRENT_TIMESTAMP WHERE districtid = ? AND status = 1');
//     const result = stmt.run(id);
    
//     if (result.changes > 0) {
//       console.log('District deleted (soft):', id);
//       res.json({ message: 'District deleted successfully!' });
//     } else {
//       res.status(404).json({ error: 'District not found or already inactive' });
//     }
//   } catch (error) {
//     console.error('Error deleting district:', error);
//     res.status(500).json({ error: 'Failed to delete district', details: error.message });
//   }
// };

// module.exports = {
//   getAllDistricts,
//   getDistrictsByState,
//   getDistrictById,
//   createDistrict,
//   updateDistrict,
//   deleteDistrict
// };




const { db } = require('../config/database');

// Get all districts
const getAllDistricts = (req, res) => {
  try {
    const districts = db.prepare(`
      SELECT 
        d.distrcitid,
        d.distrcitname,
        d.ditcrictcode,
        d.stateid,
        d.description,
        d.status,
        d.created_date,
        s.statename as state_name,
        c.countryname as country_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE d.status = 1 
      ORDER BY d.distrcitname
    `).all();
    console.log('Fetched districts:', districts);
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
  }
};

// Get districts by state
const getDistrictsByState = (req, res) => {
  const { stateId } = req.params;
  if (!stateId) {
    return res.status(400).json({ error: 'State ID is required' });
  }
  try {
    const districts = db.prepare(`
      SELECT 
        d.distrcitid,
        d.distrcitname,
        d.ditcrictcode,
        d.stateid,
        d.description,
        d.status,
        d.created_date,
        s.statename as state_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      WHERE d.stateid = ? AND d.status = 1 
      ORDER BY d.distrcitname
    `).all(stateId);
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts by state:', error);
    res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
  }
};

// Get single district by ID
const getDistrictById = (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'District ID is required' });
  }
  try {
    const district = db.prepare(`
      SELECT 
        d.distrcitid,
        d.distrcitname,
        d.ditcrictcode,
        d.stateid,
        d.description,
        d.status,
        d.created_date,
        s.statename as state_name,
        c.countryname as country_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE d.distrcitid = ? AND d.status = 1
    `).get(id);
    
    if (district) {
      res.json(district);
    } else {
      res.status(404).json({ error: 'District not found' });
    }
  } catch (error) {
    console.error('Error fetching district:', error);
    res.status(500).json({ error: 'Failed to fetch district', details: error.message });
  }
};

// Create new district
const createDistrict = (req, res) => {
  const { distrcitname, ditcrictcode, stateid, description } = req.body;
  
  if (!distrcitname || !ditcrictcode || !stateid) {
    return res.status(400).json({ error: 'District name, code, and state ID are required' });
  }

  try {
    // Verify stateid exists and is active
    const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND status = 1').get(stateid);
    if (!state) {
      return res.status(400).json({ error: 'Invalid or inactive state ID' });
    }

    const stmt = db.prepare(`
      INSERT INTO ldg_districts (distrcitname, ditcrictcode, stateid, description, created_date) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(distrcitname, ditcrictcode, stateid, description || null);
    
    const newDistrict = db.prepare(`
      SELECT 
        d.distrcitid,
        d.distrcitname,
        d.ditcrictcode,
        d.stateid,
        d.description,
        d.status,
        d.created_date,
        s.statename as state_name,
        c.countryname as country_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE d.distrcitid = ?
    `).get(result.lastInsertRowid);
    
    console.log('New district created:', newDistrict);
    res.status(201).json({
      message: 'District created successfully!',
      district: newDistrict
    });
  } catch (error) {
    console.error('Error creating district:', error);
    res.status(500).json({ error: 'Failed to create district', details: error.message });
  }
};

// Update district
const updateDistrict = (req, res) => {
  const { distrcitname, ditcrictcode, stateid, description } = req.body;
  const { id } = req.params;

  if (!distrcitname || !ditcrictcode || !stateid) {
    return res.status(400).json({ error: 'District name, code, and state ID are required' });
  }

  try {
    // Verify stateid exists and is active
    const state = db.prepare('SELECT stateid FROM ldg_states WHERE stateid = ? AND status = 1').get(stateid);
    if (!state) {
      return res.status(400).json({ error: 'Invalid or inactive state ID' });
    }

    const stmt = db.prepare(`
      UPDATE ldg_districts 
      SET distrcitname = ?, ditcrictcode = ?, stateid = ?, description = ?, updated_date = CURRENT_TIMESTAMP 
      WHERE distrcitid = ? AND status = 1
    `);
    const result = stmt.run(distrcitname, ditcrictcode, stateid, description || null, id);
    
    if (result.changes > 0) {
      const updatedDistrict = db.prepare(`
        SELECT 
          d.distrcitid,
          d.distrcitname,
          d.ditcrictcode,
          d.stateid,
          d.description,
          d.status,
          d.created_date,
          s.statename as state_name,
          c.countryname as country_name 
        FROM ldg_districts d 
        LEFT JOIN ldg_states s ON d.stateid = s.stateid 
        LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
        WHERE d.distrcitid = ?
      `).get(id);
      console.log('Updated district:', updatedDistrict);
      res.json({ message: 'District updated successfully!', district: updatedDistrict });
    } else {
      res.status(404).json({ error: 'District not found or inactive' });
    }
  } catch (error) {
    console.error('Error updating district:', error);
    res.status(500).json({ error: 'Failed to update district', details: error.message });
  }
};

// Delete district (soft delete)
const deleteDistrict = (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'District ID is required' });
  }
  try {
    const stmt = db.prepare('UPDATE ldg_districts SET status = 0, updated_date = CURRENT_TIMESTAMP WHERE distrcitid = ? AND status = 1');
    const result = stmt.run(id);
    
    if (result.changes > 0) {
      console.log('District deleted (soft):', id);
      res.json({ message: 'District deleted successfully!' });
    } else {
      res.status(404).json({ error: 'District not found or already inactive' });
    }
  } catch (error) {
    console.error('Error deleting district:', error);
    res.status(500).json({ error: 'Failed to delete district', details: error.message });
  }
};

module.exports = {
  getAllDistricts,
  getDistrictsByState,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict
};