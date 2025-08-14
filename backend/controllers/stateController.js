const { db } = require('../config/database');

// Get all states
const getAllStates = (req, res) => {
  try {
    const states = db.prepare(`
      SELECT 
        s.stateid,
        s.statename,
        s.statecode,
        s.statecapital,
        s.countryid,
        s.status,
        s.created_date, -- Explicitly include created_date
        c.countryname as country_name 
      FROM ldg_states s 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE s.status = 1 
      ORDER BY s.statename
    `).all();
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states', details: error.message });
  }
};;

// Get states by country
const getStatesByCountry = (req, res) => {
  try {
    const states = db.prepare(`
      SELECT 
        stateid,
        statename,
        statecode,
        statecapital,
        countryid,
        status
      FROM ldg_states 
      WHERE countryid = ? AND status = 1 
      ORDER BY statename
    `).all(req.params.countryId);
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch states', details: error.message });
  }
};

// Get single state by ID
const getStateById = (req, res) => {
  try {
    const state = db.prepare(`
      SELECT s.*, c.countryname as country_name 
      FROM ldg_states s 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE s.stateid = ? AND s.status = 1
    `).get(req.params.id);
    
    if (state) {
      res.json(state);
    } else {
      res.status(404).json({ error: 'State not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch state', details: error.message });
  }
};

// Create new state
const createState = (req, res) => {
      const { statename, statecode, statecapital, countryid } = req.body;
    
    if (!statename || !statecode || !countryid) {
      return res.status(400).json({ error: 'State name, code, and country ID are required' });
    }

    try {
      const stmt = db.prepare('INSERT INTO ldg_states (statename, statecode, statecapital, countryid) VALUES (?, ?, ?, ?)');
      const result = stmt.run(statename, statecode, statecapital, countryid);
    
    // Get the newly created state with all fields
    const newState = db.prepare(`
      SELECT s.*, c.countryname as country_name 
      FROM ldg_states s 
      LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
      WHERE s.stateid = ?
    `).get(result.lastInsertRowid);
    
  
    console.log('New state created with created_date:', newState.created_date);
    res.status(201).json({
      message: 'State created successfully!',
      state: newState
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create state', details: error.message });
  }
};

// Update state
// const updateState = (req, res) => {
//   const { statename, statecode, statecapital, countryid } = req.body;
//   const { id } = req.params;

//   if (!statename || !statecode || !countryid) {
//     return res.status(400).json({ error: 'State name, code, and country ID are required' });
//   }

//   try {
//     const stmt = db.prepare('UPDATE ldg_states SET statename = ?, statecode = ?, statecapital = ?, countryid = ?, updated_date = CURRENT_TIMESTAMP WHERE stateid = ?');
//     const result = stmt.run(statename, statecode, statecapital, countryid, id);
    
//     if (result.changes > 0) {
//       res.json({ message: 'State updated successfully!' });
//     } else {
//       res.status(404).json({ error: 'State not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update state', details: error.message });
//   }
// };

const updateState = (req, res) => {
  const { statename, statecode, statecapital, countryid } = req.body;
  const { id } = req.params;

  if (!statename || !statecode || !countryid) {
    return res.status(400).json({ error: 'State name, code, and country ID are required' });
  }

  try {
    const stmt = db.prepare('UPDATE ldg_states SET statename = ?, statecode = ?, statecapital = ?, countryid = ?, updated_date = CURRENT_TIMESTAMP WHERE stateid = ?');
    const result = stmt.run(statename, statecode, statecapital, countryid, id);
    
    if (result.changes > 0) {
      // Fetch the updated state including created_date
      const updatedState = db.prepare(`
        SELECT s.*, c.countryname as country_name 
        FROM ldg_states s 
        LEFT JOIN ldg_countries c ON s.countryid = c.countryid 
        WHERE s.stateid = ?
      `).get(id);
      res.json({ message: 'State updated successfully!', state: updatedState });
    } else {
      res.status(404).json({ error: 'State not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update state', details: error.message });
  }
};

// Delete state (soft delete)
const deleteState = (req, res) => {
  try {
    const stmt = db.prepare('UPDATE ldg_states SET status = 0, updated_date = CURRENT_TIMESTAMP WHERE stateid = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes > 0) {
      res.json({ message: 'State deleted successfully!' });
    } else {
      res.status(404).json({ error: 'State not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete state', details: error.message });
  }
};

module.exports = {
  getAllStates,
  getStatesByCountry,
  getStateById,
  createState,
  updateState,
  deleteState
};



