const { db } = require('../config/database');

// Get all districts
const getAllDistricts = (req, res) => {
  try {
    const districts = db.prepare(`
      SELECT 
        d.distrcitid as districtid,
        d.distrcitname as district_name,
        d.ditcrictcode,
        d.stateid,
        d.description,
        d.status,
        s.statename as state_name, 
        c.countryname as country_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE d.status = 1 
      ORDER BY d.distrcitname
    `).all();
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
  }
};

// Get districts by state
const getDistrictsByState = (req, res) => {
  try {
    const districts = db.prepare(`
      SELECT 
        d.distrcitid as districtid,
        d.distrcitname as district_name,
        d.ditcrictcode,
        d.stateid,
        d.description,
        d.status,
        s.statename as state_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      WHERE d.stateid = ? AND d.status = 1 
      ORDER BY d.distrcitname
    `).all(req.params.stateId);
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
  }
};

// Get single district by ID
const getDistrictById = (req, res) => {
  try {
    const district = db.prepare(`
      SELECT d.*, s.statename as state_name, c.countryname as country_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE d.distrcitid = ? AND d.status = 1
    `).get(req.params.id);
    
    if (district) {
      res.json(district);
    } else {
      res.status(404).json({ error: 'District not found' });
    }
  } catch (error) {
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
    const stmt = db.prepare('INSERT INTO ldg_districts (distrcitname, ditcrictcode, stateid, description) VALUES (?, ?, ?, ?)');
    const result = stmt.run(distrcitname, ditcrictcode, stateid, description);
    
    // Get the newly created district with all fields
    const newDistrict = db.prepare(`
      SELECT d.*, s.statename as state_name, c.countryname as country_name 
      FROM ldg_districts d 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE d.distrcitid = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'District created successfully!',
      district: newDistrict
    });
  } catch (error) {
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
    const stmt = db.prepare('UPDATE ldg_districts SET distrcitname = ?, ditcrictcode = ?, stateid = ?, description = ?, updated_date = CURRENT_TIMESTAMP WHERE distrcitid = ?');
    const result = stmt.run(distrcitname, ditcrictcode, stateid, description, id);
    
    if (result.changes > 0) {
      res.json({ message: 'District updated successfully!' });
    } else {
      res.status(404).json({ error: 'District not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update district', details: error.message });
  }
};

// Delete district (soft delete)
const deleteDistrict = (req, res) => {
  try {
    const stmt = db.prepare('UPDATE ldg_districts SET status = 0, updated_date = CURRENT_TIMESTAMP WHERE distrcitid = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes > 0) {
      res.json({ message: 'District deleted successfully!' });
    } else {
      res.status(404).json({ error: 'District not found' });
    }
  } catch (error) {
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