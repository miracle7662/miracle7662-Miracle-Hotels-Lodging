const { db } = require('../config/database');

// Get all zones
const getAllZones = (req, res) => {
  try {
    const zones = db.prepare(`
      SELECT z.zoneid, z.zonename, z.zonecode, z.districtid, z.description, z.status, z.created_date, z.updated_date,
             d.distrcitname as district_name, s.statename as state_name, c.countryname as country_name 
      FROM ldg_zones z 
      LEFT JOIN ldg_districts d ON z.districtid = d.distrcitid 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE z.status = 1 
      ORDER BY z.zonename
    `).all();
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones', details: error.message });
  }
};

// Get zones by district
const getZonesByDistrict = (req, res) => {
  try {
    const zones = db.prepare(`
      SELECT z.zoneid, z.zonename, z.zonecode, z.districtid, z.description, z.status, z.created_date, z.updated_date,
             d.distrcitname as district_name 
      FROM ldg_zones z 
      LEFT JOIN ldg_districts d ON z.districtid = d.distrcitid 
      WHERE z.districtid = ? AND z.status = 1 
      ORDER BY z.zonename
    `).all(req.params.districtId);
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones', details: error.message });
  }
};

// Get single zone by ID
const getZoneById = (req, res) => {
  try {
    const zone = db.prepare(`
      SELECT z.zoneid, z.zonename, z.zonecode, z.districtid, z.description, z.status, z.created_date, z.updated_date,
             d.distrcitname as district_name, s.statename as state_name, c.countryname as country_name 
      FROM ldg_zones z 
      LEFT JOIN ldg_districts d ON z.districtid = d.distrcitid 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE z.zoneid = ? AND z.status = 1
    `).get(req.params.id);
    
    if (zone) {
      res.json(zone);
    } else {
      res.status(404).json({ error: 'Zone not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zone', details: error.message });
  }
};

// Create new zone
const createZone = (req, res) => {
  const { zonename, zonecode, districtid, description } = req.body;
  
  if (!zonename || !zonecode || !districtid) {
    return res.status(400).json({ error: 'Zone name, zone code, and district ID are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO ldg_zones (zonename, zonecode, districtid, description) VALUES (?, ?, ?, ?)');
    const result = stmt.run(zonename, zonecode, districtid, description);
    
    // Get the newly created zone with all fields
    const newZone = db.prepare(`
      SELECT z.zoneid, z.zonename, z.zonecode, z.districtid, z.description, z.status, z.created_date, z.updated_date,
             d.distrcitname as district_name, s.statename as state_name, c.countryname as country_name 
      FROM ldg_zones z 
      LEFT JOIN ldg_districts d ON z.districtid = d.distrcitid 
      LEFT JOIN ldg_states s ON d.stateid = s.stateid 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE z.zoneid = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Zone created successfully!',
      zone: newZone
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create zone', details: error.message });
  }
};

// Update zone
const updateZone = (req, res) => {
  const { zonename, zonecode, districtid, description } = req.body;
  const { id } = req.params;

  if (!zonename || !zonecode || !districtid) {
    return res.status(400).json({ error: 'Zone name, zone code, and district ID are required' });
  }

  try {
    const stmt = db.prepare('UPDATE ldg_zones SET zonename = ?, zonecode = ?, districtid = ?, description = ?, updated_date = CURRENT_TIMESTAMP WHERE zoneid = ?');
    const result = stmt.run(zonename, zonecode, districtid, description, id);
    
    if (result.changes > 0) {
      res.json({ message: 'Zone updated successfully!' });
    } else {
      res.status(404).json({ error: 'Zone not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update zone', details: error.message });
  }
};

// Delete zone (soft delete)
const deleteZone = (req, res) => {
  try {
    const stmt = db.prepare('UPDATE ldg_zones SET status = 0, updated_date = CURRENT_TIMESTAMP WHERE zoneid = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes > 0) {
      res.json({ message: 'Zone deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Zone not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete zone', details: error.message });
  }
};

module.exports = {
  getAllZones,
  getZonesByDistrict,
  getZoneById,
  createZone,
  updateZone,
  deleteZone
};