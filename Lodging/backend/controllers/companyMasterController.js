const { db } = require('../config/database');

// List all companies
const getAllCompanies = (req, res) => {
  try {
    const companies = db.prepare(`
      SELECT cm.*, h.hotel_name
      FROM ldg_mstcompanymaster cm
      LEFT JOIN hotels h ON cm.hotel_id = h.id
      ORDER BY cm.created_date DESC
    `).all();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Get company by id
const getCompanyById = (req, res) => {
  try {
    const { id } = req.params;
    const company = db.prepare(`
      SELECT cm.*, h.hotel_name
      FROM ldg_mstcompanymaster cm
      LEFT JOIN hotels h ON cm.hotel_id = h.id
      WHERE cm.company_id = ?
    `).get(id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

// Create company
const createCompany = (req, res) => {
  try {
    const {
      title,
      name,
      display_name,
      establishment_date,
      address,
      countryid,
      stateid,
      cityid,
      phone1,
      phone2,
      gst_number,
      mobile,
      email,
      website,
      booking_contact_name,
      booking_contact_mobile,
      booking_contact_phone,
      corresponding_contact_name,
      corresponding_contact_mobile,
      corresponding_contact_phone,
      credit_limit,
      is_credit_allow = 0,
      is_company = 1,
      is_discount,
      discount_percent,
      hotel_id,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO ldg_mstcompanymaster (
        title, name, display_name, establishment_date, address,
        countryid, stateid, cityid,
        phone1, phone2, gst_number, mobile, email, website,
        booking_contact_name, booking_contact_mobile, booking_contact_phone,
        corresponding_contact_name, corresponding_contact_mobile, corresponding_contact_phone,
        credit_limit, is_credit_allow, is_company, is_discount, discount_percent, hotel_id,
        created_by_id
      ) VALUES (
        @title, @name, @display_name, @establishment_date, @address,
        @countryid, @stateid, @cityid,
        @phone1, @phone2, @gst_number, @mobile, @email, @website,
        @booking_contact_name, @booking_contact_mobile, @booking_contact_phone,
        @corresponding_contact_name, @corresponding_contact_mobile, @corresponding_contact_phone,
        @credit_limit, @is_credit_allow, @is_company, @is_discount, @discount_percent, @hotel_id,
        @created_by_id
      )
    `);

    const result = stmt.run({
      title: title || '',
      name: name || '',
      display_name: display_name || '',
      establishment_date: establishment_date || '',
      address: address || '',
      countryid: countryid ?? null,
      stateid: stateid ?? null,
      cityid: cityid ?? null,
      phone1: phone1 || '',
      phone2: phone2 || '',
      gst_number: gst_number || '',
      mobile: mobile || '',
      email: email || '',
      website: website || '',
      booking_contact_name: booking_contact_name || '',
      booking_contact_mobile: booking_contact_mobile || '',
      booking_contact_phone: booking_contact_phone || '',
      corresponding_contact_name: corresponding_contact_name || '',
      corresponding_contact_mobile: corresponding_contact_mobile || '',
      corresponding_contact_phone: corresponding_contact_phone || '',
      credit_limit: credit_limit || '',
      is_credit_allow: Number(is_credit_allow) || 0,
      is_company: Number(is_company) || 1,
      is_discount: is_discount || '',
      discount_percent: discount_percent ?? null,
      hotel_id: hotel_id ?? null,
      created_by_id: (req.user && req.user.id) || null,
    });

    res.status(201).json({
      message: 'Company created successfully!',
      company_id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
};

// Update company
const updateCompany = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT company_id FROM ldg_mstcompanymaster WHERE company_id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Company not found' });

    const {
      title,
      name,
      display_name,
      establishment_date,
      address,
      countryid,
      stateid,
      cityid,
      phone1,
      phone2,
      gst_number,
      mobile,
      email,
      website,
      booking_contact_name,
      booking_contact_mobile,
      booking_contact_phone,
      corresponding_contact_name,
      corresponding_contact_mobile,
      corresponding_contact_phone,
      credit_limit,
      is_credit_allow,
      is_company,
      is_discount,
      discount_percent,
      hotel_id,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE ldg_mstcompanymaster SET
        title = ?, name = ?, display_name = ?, establishment_date = ?, address = ?,
        countryid = ?, stateid = ?, cityid = ?,
        phone1 = ?, phone2 = ?, gst_number = ?, mobile = ?, email = ?, website = ?,
        booking_contact_name = ?, booking_contact_mobile = ?, booking_contact_phone = ?,
        corresponding_contact_name = ?, corresponding_contact_mobile = ?, corresponding_contact_phone = ?,
        credit_limit = ?, is_credit_allow = ?, is_company = ?, is_discount = ?, discount_percent = ?, hotel_id = ?,
        updated_by_id = ?, updated_date = CURRENT_TIMESTAMP
      WHERE company_id = ?
    `);

    stmt.run(
      title || '',
      name || '',
      display_name || '',
      establishment_date || '',
      address || '',
      countryid ?? null,
      stateid ?? null,
      cityid ?? null,
      phone1 || '',
      phone2 || '',
      gst_number || '',
      mobile || '',
      email || '',
      website || '',
      booking_contact_name || '',
      booking_contact_mobile || '',
      booking_contact_phone || '',
      corresponding_contact_name || '',
      corresponding_contact_mobile || '',
      corresponding_contact_phone || '',
      credit_limit || '',
      Number(is_credit_allow) || 0,
      Number(is_company) || 1,
      is_discount || '',
      discount_percent ?? null,
      hotel_id ?? null,
      (req.user && req.user.id) || null,
      id
    );

    res.json({ message: 'Company updated successfully!' });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
};

// Delete company
const deleteCompany = (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM ldg_mstcompanymaster WHERE company_id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted successfully!' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};


