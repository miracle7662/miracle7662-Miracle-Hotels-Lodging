const db = require('../config/database');

// Get all districts with state and country information
const getAllDistricts = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.districtid,
        d.district_name,
        d.districtcode,
        d.description,
        d.status,
        d.created_at,
        d.updated_at,
        s.statename as state_name,
        s.stateid,
        c.countryname as country_name,
        c.countryid
      FROM districts d
      LEFT JOIN states s ON d.stateid = s.stateid
      LEFT JOIN countries c ON s.countryid = c.countryid
      ORDER BY d.district_name ASC
    `;
    
    const districts = await new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
};

// Get district by ID
const getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        d.*,
        s.statename as state_name,
        c.countryname as country_name
      FROM districts d
      LEFT JOIN states s ON d.stateid = s.stateid
      LEFT JOIN countries c ON s.countryid = c.countryid
      WHERE d.districtid = ?
    `;
    
    const district = await new Promise((resolve, reject) => {
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!district) {
      return res.status(404).json({ error: 'District not found' });
    }

    res.json(district);
  } catch (error) {
    console.error('Error fetching district:', error);
    res.status(500).json({ error: 'Failed to fetch district' });
  }
};

// Create new district
const createDistrict = async (req, res) => {
  try {
    const { district_name, districtcode, stateid, description, status } = req.body;

    // Validate required fields
    if (!district_name || !districtcode || !stateid) {
      return res.status(400).json({ 
        error: 'District name, code, and state are required' 
      });
    }

    // Check if district code already exists
    const existingDistrict = await new Promise((resolve, reject) => {
      db.get(
        'SELECT districtid FROM districts WHERE districtcode = ?',
        [districtcode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingDistrict) {
      return res.status(400).json({ 
        error: 'District code already exists' 
      });
    }

    const query = `
      INSERT INTO districts (district_name, districtcode, stateid, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;

    const result = await new Promise((resolve, reject) => {
      db.run(
        query,
        [district_name, districtcode, stateid, description || '', status || 1],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Fetch the newly created district with state and country info
    const newDistrict = await new Promise((resolve, reject) => {
      db.get(
        `
        SELECT 
          d.*,
          s.statename as state_name,
          c.countryname as country_name
        FROM districts d
        LEFT JOIN states s ON d.stateid = s.stateid
        LEFT JOIN countries c ON s.countryid = c.countryid
        WHERE d.districtid = ?
        `,
        [result.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.status(201).json({ 
      message: 'District created successfully',
      district: newDistrict 
    });
  } catch (error) {
    console.error('Error creating district:', error);
    res.status(500).json({ error: 'Failed to create district' });
  }
};

// Update district
const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { district_name, districtcode, stateid, description, status } = req.body;

    // Validate required fields
    if (!district_name || !districtcode || !stateid) {
      return res.status(400).json({ 
        error: 'District name, code, and state are required' 
      });
    }

    // Check if district code already exists (excluding current district)
    const existingDistrict = await new Promise((resolve, reject) => {
      db.get(
        'SELECT districtid FROM districts WHERE districtcode = ? AND districtid != ?',
        [districtcode, id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingDistrict) {
      return res.status(400).json({ 
        error: 'District code already exists' 
      });
    }

    const query = `
      UPDATE districts 
      SET district_name = ?, districtcode = ?, stateid = ?, 
          description = ?, status = ?, updated_at = datetime('now')
      WHERE districtid = ?
    `;

    const result = await new Promise((resolve, reject) => {
      db.run(
        query,
        [district_name, districtcode, stateid, description || '', status || 1, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    // Fetch the updated district with state and country info
    const updatedDistrict = await new Promise((resolve, reject) => {
      db.get(
        `
        SELECT 
          d.*,
          s.statename as state_name,
          c.countryname as country_name
        FROM districts d
        LEFT JOIN states s ON d.stateid = s.stateid
        LEFT JOIN countries c ON s.countryid = c.countryid
        WHERE d.districtid = ?
        `,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({ 
      message: 'District updated successfully',
      district: updatedDistrict 
    });
  } catch (error) {
    console.error('Error updating district:', error);
    res.status(500).json({ error: 'Failed to update district' });
  }
};

// Delete district
const deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if district is being used by any other entities
    const usageCheck = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM cities WHERE districtid = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (usageCheck.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete district as it is being used by cities' 
      });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM districts WHERE districtid = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: 'District not found' });
    }

    res.json({ message: 'District deleted successfully' });
  } catch (error) {
    console.error('Error deleting district:', error);
    res.status(500).json({ error: 'Failed to delete district' });
  }
};

// Get districts by state
const getDistrictsByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    
    const query = `
      SELECT 
        d.districtid,
        d.district_name,
        d.districtcode,
        d.description,
        d.status
      FROM districts d
      WHERE d.stateid = ? AND d.status = 1
      ORDER BY d.district_name ASC
    `;
    
    const districts = await new Promise((resolve, reject) => {
      db.all(query, [stateId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts by state:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
};

module.exports = {
  getAllDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  getDistrictsByState
};
