const { db } = require('../config/database');

// Get all countries
const getAllCountries = (req, res) => {
  try {
    const countries = db.prepare(`
      SELECT 
        countryid,
        countryname,
        countrycode,
        countrycapital,
        status
      FROM ldg_countries 
      WHERE status = 1 
      ORDER BY countryname
    `).all();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries', details: error.message });
  }
};

// Get single country by ID
const getCountryById = (req, res) => {
  try {
    const country = db.prepare('SELECT * FROM ldg_countries WHERE countryid = ? AND status = 1').get(req.params.id);
    if (country) {
      res.json(country);
    } else {
      res.status(404).json({ error: 'Country not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch country', details: error.message });
  }
};

// Create new country
const createCountry = (req, res) => {
  const { countryname, countrycode, countrycapital,status=1 } = req.body;

  if (!countryname || !countrycode) {
    return res.status(400).json({ error: 'Country name and code are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO ldg_countries (countryname, countrycode, countrycapital,status) VALUES (?, ?, ?, ?)');
    const result = stmt.run(countryname, countrycode, countrycapital,status);
    
    // Get the newly created country with all fields
    const newCountry = db.prepare('SELECT * FROM ldg_countries WHERE countryid = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Country created successfully!',
      country: newCountry
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create country', details: error.message });
  }
};

// Update country
const updateCountry = (req, res) => {
  const { countryname, countrycode, countrycapital,status=1 } = req.body;
  const { id } = req.params;

  if (!countryname || !countrycode) {
    return res.status(400).json({ error: 'Country name and code are required' });
  }

  try {
    const stmt = db.prepare('UPDATE ldg_countries SET countryname = ?, countrycode = ?, countrycapital = ?, status = ?, updated_date = CURRENT_TIMESTAMP WHERE countryid = ?');
    const result = stmt.run(countryname, countrycode, countrycapital, status, id);

    if (result.changes > 0) {
      res.json({ message: 'Country updated successfully!' });
    } else {
      res.status(404).json({ error: 'Country not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update country', details: error.message });
  }
};

// Delete country (soft delete)
const deleteCountry = (req, res) => {
  try {
    const stmt = db.prepare('UPDATE ldg_countries SET status = 0, updated_date = CURRENT_TIMESTAMP WHERE countryid = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes > 0) {
      res.json({ message: 'Country deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Country not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete country', details: error.message });
  }
};

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry
};