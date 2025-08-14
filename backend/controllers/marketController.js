const { db } = require('../config/database');

// Get all markets
const getAllMarkets = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM ldg_mstmarkets 
      ORDER BY ldg_marketid DESC
    `);
    const markets = stmt.all();
    
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch markets', details: error.message });
  }
};

// Get single market by ID
const getMarketById = (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM ldg_mstmarkets WHERE ldg_marketid = ?
    `);
    const market = stmt.get(id);
    
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }
    
    res.json(market);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market', details: error.message });
  }
};

// Create new market
const createMarket = (req, res) => {
  const { ldg_market_name } = req.body;

  if (!ldg_market_name) {
    return res.status(400).json({ error: 'Market name is required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO ldg_mstmarkets (ldg_market_name)
      VALUES (?)
    `);
    const result = stmt.run(ldg_market_name);

    // Get the newly created market
    const newMarket = db.prepare(`
      SELECT * FROM ldg_mstmarkets WHERE ldg_marketid = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Market created successfully!',
      market: newMarket
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create market', details: error.message });
  }
};

// Update market
const updateMarket = (req, res) => {
  const { id } = req.params;
  const { ldg_market_name, ldg_status } = req.body;

  if (!ldg_market_name) {
    return res.status(400).json({ error: 'Market name is required' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstmarkets 
      SET ldg_market_name = ?, ldg_status = ?, ldg_updated_date = CURRENT_TIMESTAMP
      WHERE ldg_marketid = ?
    `);
    const result = stmt.run(ldg_market_name, ldg_status || 1, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // Get the updated market
    const updatedMarket = db.prepare(`
      SELECT * FROM ldg_mstmarkets WHERE ldg_marketid = ?
    `).get(id);

    res.json({
      message: 'Market updated successfully!',
      market: updatedMarket
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update market', details: error.message });
  }
};

// Delete market (soft delete by setting status to 0)
const deleteMarket = (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare(`
      UPDATE ldg_mstmarkets 
      SET ldg_status = 0, ldg_updated_date = CURRENT_TIMESTAMP
      WHERE ldg_marketid = ?
    `);
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Market not found' });
    }

    res.json({ message: 'Market deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete market', details: error.message });
  }
};

module.exports = {
  getAllMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket
}; 