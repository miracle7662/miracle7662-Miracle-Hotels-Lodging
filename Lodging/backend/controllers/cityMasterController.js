const { db } = require('../config/database');

// Get all cities
const getAllCities = (req, res) => {
  try {
    const query = `
      SELECT 
        cm.*,
        c.countryname as country_name,
        s.statename as state_name,
        d.distrcitname as district_name
      FROM ldg_citymaster cm
      LEFT JOIN ldg_countries c ON cm.countryid = c.countryid
      LEFT JOIN ldg_states s ON cm.stateid = s.stateid
      LEFT JOIN ldg_districts d ON cm.districtid = d.distrcitid
      ORDER BY cm.created_date DESC
    `;
    
    const cities = db.prepare(query).all();
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.message
    });
  }
};

// Get cities by state_id
const getCitiesByState = (req, res) => {
  try {
    const { stateId } = req.params;
    console.log('Fetching cities for stateId:', stateId);
    
    const query = `
      SELECT 
        cm.cityid as cityid,
        cm.cityname as city_name,
        cm.stateid as stateid,
        cm.districtid as districtid,
        cm.status
      FROM ldg_citymaster cm
      WHERE cm.stateid = ? AND (cm.status = 1 OR cm.status IS NULL)
      ORDER BY cm.cityname
    `;
    
    const rows = db.prepare(query).all(stateId);
    console.log('Found cities:', rows);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching cities by state:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities by state',
      error: error.message
    });
  }
};

// Get cities by state and district
const getCitiesByStateAndDistrict = (req, res) => {
  try {
    const { stateId, districtId } = req.params;
    console.log('Fetching cities for stateId:', stateId, 'districtId:', districtId);
    
    const query = `
      SELECT 
        cm.cityid as cityid,
        cm.cityname as city_name,
        cm.stateid as stateid,
        cm.districtid as districtid,
        cm.status
      FROM ldg_citymaster cm
      WHERE cm.stateid = ? AND cm.districtid = ? AND (cm.status = 1 OR cm.status IS NULL)
      ORDER BY cm.cityname
    `;
    
    const rows = db.prepare(query).all(stateId, districtId);
    console.log('Found cities:', rows);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching cities by state and district:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities by state and district',
      error: error.message
    });
  }
};

// Get city by ID
const getCityById = (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        cm.*,
        c.countryname as country_name,
        s.statename as state_name,
        d.distrcitname as district_name
      FROM ldg_citymaster cm
      LEFT JOIN ldg_countries c ON cm.countryid = c.countryid
      LEFT JOIN ldg_states s ON cm.stateid = s.stateid
      LEFT JOIN ldg_districts d ON cm.districtid = d.distrcitid
      WHERE cm.cityid = ?
    `;
    
    const city = db.prepare(query).get(id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }
    
    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching city',
      error: error.message
    });
  }
};

// Create new city
const createCity = (req, res) => {
  try {
    const {
      countryid,
      stateid,
      districtid,
      cityname,
      status = 1
    } = req.body;

    // Validation
    if (!countryid || !stateid || !districtid || !cityname) {
      return res.status(400).json({
        success: false,
        message: 'Country ID, State ID, District ID, and City Name are required'
      });
    }

    const query = `
      INSERT INTO ldg_citymaster (
        countryid, stateid, districtid, cityname, status, created_by_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = db.prepare(query).run(
      countryid,
      stateid,
      districtid,
      cityname,
      status,
      null
    );
    
    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: { cityid: result.lastInsertRowid }
    });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating city',
      error: error.message
    });
  }
};

// Update city
const updateCity = (req, res) => {
  try {
    const { id } = req.params;
    const {
      countryid,
      stateid,
      districtid,
      cityname,
      status
    } = req.body;

    // Validation
    if (!countryid || !stateid || !districtid || !cityname) {
      return res.status(400).json({
        success: false,
        message: 'Country ID, State ID, District ID, and City Name are required'
      });
    }

    const query = `
      UPDATE ldg_citymaster 
      SET countryid = ?, stateid = ?, districtid = ?, cityname = ?, 
          status = ?, updated_by_id = ?, updated_date = CURRENT_TIMESTAMP
      WHERE cityid = ?
    `;
    
    const result = db.prepare(query).run(
      countryid,
      stateid,
      districtid,
      cityname,
      status,
      null,
      id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }
    
    res.json({
      success: true,
      message: 'City updated successfully'
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating city',
      error: error.message
    });
  }
};

// Delete city
const deleteCity = (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM ldg_citymaster WHERE cityid = ?';
    const result = db.prepare(query).run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }
    
    res.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting city',
      error: error.message
    });
  }
};

module.exports = {
  getAllCities,
  getCityById,
  // New method exported
  getCitiesByState,
  getCitiesByStateAndDistrict,
  createCity,
  updateCity,
  deleteCity
};
