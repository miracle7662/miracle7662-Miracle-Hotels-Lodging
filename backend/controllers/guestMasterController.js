const { db } = require('../config/database');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  sharp = null;
}

const uploadsGuestsDir = path.join(__dirname, '..', 'uploads', 'guests');

const sanitizeFileName = (name) =>
  (name || 'guest')
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');

// Combine any provided image files into a single PDF, named with the guest name
const generateDocumentsPdf = async (filesMap, guestName) => {
  try {
    if (!filesMap) return null;
    const order = ['adhar_front', 'adhar_back', 'adhar_no', 'pan_no', 'driving_license', 'Other'];
    const files = [];
    for (const key of order) {
      if (filesMap[key] && Array.isArray(filesMap[key]) && filesMap[key][0]) {
        files.push(filesMap[key][0]);
      }
    }
    if (files.length === 0) return null;

    const base = sanitizeFileName(guestName);
    const pdfName = `${base}-${Date.now()}.pdf`;
    const pdfPath = path.join(uploadsGuestsDir, pdfName);
    const publicPath = `/uploads/guests/${pdfName}`;

    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    for (const file of files) {
      try {
        let fullPath = path.join(uploadsGuestsDir, file.filename);
        // Convert unsupported formats to PNG if sharp is available
        const isJpegPng =
          (file.mimetype && (file.mimetype.includes('jpeg') || file.mimetype.includes('png')))
          || /\.(jpe?g|png)$/i.test(fullPath);
        if (!isJpegPng && sharp) {
          const convName = `${path.parse(fullPath).name}-conv-${Date.now()}.png`;
          const convPath = path.join(uploadsGuestsDir, convName);
          try {
            await sharp(fullPath).png().toFile(convPath);
            fullPath = convPath;
          } catch (e) {
            // If conversion fails, proceed with original path; pdfkit may skip it
          }
        }
        // Prefer image's natural size for page to avoid blanks
        let img;
        try {
          img = doc.openImage(fullPath);
        } catch (e) {
          img = null;
        }
        if (img) {
          doc.addPage({ size: [img.width, img.height] });
          doc.image(fullPath, 0, 0, { width: img.width, height: img.height });
        } else {
          doc.addPage({ size: 'A4' });
          const pageWidth = doc.page.width;
          const pageHeight = doc.page.height;
          const margin = 20;
          doc.image(fullPath, margin, margin, {
            fit: [pageWidth - margin * 2, pageHeight - margin * 2],
            align: 'center',
            valign: 'center',
          });
        }
      } catch (e) {
        // skip unreadable files and continue
      }
    }

    // Ensure at least one page exists
    if (doc.page === null) {
      doc.addPage({ size: 'A4' }).text('No documents uploaded');
    }

    doc.end();
    await new Promise((resolve) => stream.on('finish', resolve));
    return publicPath;
  } catch (e) {
    return null;
  }
};

// List all guests
const getAllGuests = (req, res) => {
  try {
    const guests = db.prepare(`
      SELECT gm.*, 
             h.hotel_name,
             c.name AS company_name,
             gt.guest_type,
             n.nationality,
             co.countryname AS country_name,
             s.statename AS state_name,
             ci.cityname AS city_name
      FROM ldg_mstguestmaster gm
      LEFT JOIN hotels h ON gm.hotelid = h.id
      LEFT JOIN ldg_mstcompanymaster c ON gm.company_id = c.company_id
      LEFT JOIN ldg_mstguesttype gt ON gm.guesttypeid = gt.guesttypeid
      LEFT JOIN ldg_mstnationalitymaster n ON gm.nationalityid = n.nationalityid
      LEFT JOIN ldg_countries co ON gm.countryid = co.countryid
      LEFT JOIN ldg_states s ON gm.stateid = s.stateid
      LEFT JOIN ldg_citymaster ci ON gm.cityid = ci.cityid
      ORDER BY gm.created_date DESC
    `).all();
    res.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
};

// Get guest by id
const getGuestById = (req, res) => {
  try {
    const { id } = req.params;
    const guest = db.prepare(`
      SELECT gm.*, 
             h.hotel_name,
             c.name as company_name,
             gt.guest_type,
             n.nationality,
             co.countryname AS country_name,
             s.statename AS state_name,
             ci.cityname AS city_name
      FROM ldg_mstguestmaster gm
      LEFT JOIN hotels h ON gm.hotelid = h.id
      LEFT JOIN ldg_mstcompanymaster c ON gm.company_id = c.company_id
      LEFT JOIN ldg_mstguesttype gt ON gm.guesttypeid = gt.guesttypeid
      LEFT JOIN ldg_mstnationalitymaster n ON gm.nationalityid = n.nationalityid
      LEFT JOIN ldg_countries co ON gm.countryid = co.countryid
      LEFT JOIN ldg_states s ON gm.stateid = s.stateid
      LEFT JOIN ldg_citymaster ci ON gm.cityid = ci.cityid
      WHERE gm.guest_id = ?
    `).get(id);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ error: 'Failed to fetch guest' });
  }
};

// Create new guest
const createGuest = async (req, res) => {
  try {
    const {
      guest_name,
      organization,
      address,
      countryid,
      stateid,
      cityid,
      company_id,
      occupation,
      postHeld,
      phone1,
      phone2,
      mobile_no,
      office_mail,
      personal_mail,
      website,
      purpose,
      arrivalFrom,
      departureTo,
      guesttypeid,
      gender,
      nationalityid,
      birthday,
      anniversary,
      creditAllowed = 0,
      isDiscountAllowed = 0,
      discountPercent,
      personalInstructions,
      adhar_no,
      pan_no,
      driving_license,
      Other,
      discount,
      gst_number,
      hotelid,
    } = req.body;

    // Combine all uploaded docs into a single PDF named by guest
    let uploadedAdhar = await generateDocumentsPdf(req.files, guest_name);
    if (!uploadedAdhar) {
      uploadedAdhar = req.files?.adhar_no?.[0]?.filename
        ? `/uploads/guests/${req.files.adhar_no[0].filename}`
        : adhar_no;
    }
    const uploadedPan = req.files?.pan_no?.[0]?.filename
      ? `/uploads/guests/${req.files.pan_no[0].filename}`
      : pan_no;
    const uploadedDriving = req.files?.driving_license?.[0]?.filename
      ? `/uploads/guests/${req.files.driving_license[0].filename}`
      : driving_license;
    const uploadedOther = req.files?.Other?.[0]?.filename
      ? `/uploads/guests/${req.files.Other[0].filename}`
      : Other;

    const stmt = db.prepare(`
      INSERT INTO ldg_mstguestmaster (
        guest_name, organization, address, countryid, stateid, cityid, company_id,
        occupation, postHeld, phone1, phone2, mobile_no,
        office_mail, personal_mail, website, purpose, arrivalFrom, departureTo,
        guesttypeid, gender, nationalityid, birthday, anniversary,
        creditAllowed, isDiscountAllowed, discountPercent, personalInstructions,
        adhar_no, pan_no, driving_license, Other, discount, gst_number, hotelid,
        created_by_id
      ) VALUES (
        @guest_name, @organization, @address, @countryid, @stateid, @cityid, @company_id,
        @occupation, @postHeld, @phone1, @phone2, @mobile_no,
        @office_mail, @personal_mail, @website, @purpose, @arrivalFrom, @departureTo,
        @guesttypeid, @gender, @nationalityid, @birthday, @anniversary,
        @creditAllowed, @isDiscountAllowed, @discountPercent, @personalInstructions,
        @adhar_no, @pan_no, @driving_license, @Other, @discount, @gst_number, @hotelid,
        @created_by_id
      )
    `);

    const result = stmt.run({
      guest_name: guest_name || '',
      organization: organization || '',
      address: address || '',
      countryid: countryid ?? null,
      stateid: stateid ?? null,
      cityid: cityid ?? null,
      company_id: company_id ?? null,
      occupation: occupation || '',
      postHeld: postHeld || '',
      phone1: phone1 || '',
      phone2: phone2 || '',
      mobile_no: mobile_no || '',
      office_mail: office_mail || '',
      personal_mail: personal_mail || '',
      website: website || '',
      purpose: purpose || '',
      arrivalFrom: arrivalFrom || '',
      departureTo: departureTo || '',
      guesttypeid: guesttypeid ?? null,
      gender: gender || '',
      nationalityid: nationalityid ?? null,
      birthday: birthday || '',
      anniversary: anniversary || '',
      creditAllowed: creditAllowed || 0,
      isDiscountAllowed: isDiscountAllowed || 0,
      discountPercent: discountPercent || '',
      personalInstructions: personalInstructions || '',
      adhar_no: uploadedAdhar || '',
      pan_no: uploadedPan || '',
      driving_license: uploadedDriving || '',
      Other: uploadedOther || '',
      discount: discount || '',
      gst_number: gst_number || '',
      hotelid: hotelid ?? null,
      created_by_id: req.user?.id || 1
    });

    res.status(201).json({
      message: 'Guest created successfully',
      guest_id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ error: 'Failed to create guest' });
  }
};

// Update guest
const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      guest_name,
      organization,
      address,
      countryid,
      stateid,
      cityid,
      company_id,
      occupation,
      postHeld,
      phone1,
      phone2,
      mobile_no,
      office_mail,
      personal_mail,
      website,
      purpose,
      arrivalFrom,
      departureTo,
      guesttypeid,
      gender,
      nationalityid,
      birthday,
      anniversary,
      creditAllowed,
      isDiscountAllowed,
      discountPercent,
      personalInstructions,
      adhar_no,
      pan_no,
      driving_license,
      Other,
      discount,
      gst_number,
      hotelid,
    } = req.body;

    // Combine docs into a single PDF named by guest
    let uploadedAdhar = await generateDocumentsPdf(req.files, guest_name);
    if (!uploadedAdhar) {
      uploadedAdhar = req.files?.adhar_no?.[0]?.filename
        ? `/uploads/guests/${req.files.adhar_no[0].filename}`
        : adhar_no;
    }
    const uploadedPan = req.files?.pan_no?.[0]?.filename
      ? `/uploads/guests/${req.files.pan_no[0].filename}`
      : pan_no;
    const uploadedDriving = req.files?.driving_license?.[0]?.filename
      ? `/uploads/guests/${req.files.driving_license[0].filename}`
      : driving_license;
    const uploadedOther = req.files?.Other?.[0]?.filename
      ? `/uploads/guests/${req.files.Other[0].filename}`
      : Other;

    const stmt = db.prepare(`
      UPDATE ldg_mstguestmaster SET
        guest_name = ?, organization = ?, address = ?, countryid = ?, stateid = ?, cityid = ?, company_id = ?,
        occupation = ?, postHeld = ?, phone1 = ?, phone2 = ?, mobile_no = ?,
        office_mail = ?, personal_mail = ?, website = ?, purpose = ?, arrivalFrom = ?, departureTo = ?,
        guesttypeid = ?, gender = ?, nationalityid = ?, birthday = ?, anniversary = ?,
        creditAllowed = ?, isDiscountAllowed = ?, discountPercent = ?, personalInstructions = ?,
        adhar_no = ?, pan_no = ?, driving_license = ?, Other = ?, discount = ?, gst_number = ?, hotelid = ?,
        updated_by_id = ?, updated_date = CURRENT_TIMESTAMP
      WHERE guest_id = ?
    `);

    const result = stmt.run(
      guest_name || '',
      organization || '',
      address || '',
      countryid ?? null,
      stateid ?? null,
      cityid ?? null,
      company_id ?? null,
      occupation || '',
      postHeld || '',
      phone1 || '',
      phone2 || '',
      mobile_no || '',
      office_mail || '',
      personal_mail || '',
      website || '',
      purpose || '',
      arrivalFrom || '',
      departureTo || '',
      guesttypeid ?? null,
      gender || '',
      nationalityid ?? null,
      birthday || '',
      anniversary || '',
      creditAllowed || 0,
      isDiscountAllowed || 0,
      discountPercent || '',
      personalInstructions || '',
      uploadedAdhar || '',
      uploadedPan || '',
      uploadedDriving || '',
      uploadedOther || '',
      discount || '',
      gst_number || '',
      hotelid ?? null,
      req.user?.id || 1,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json({ message: 'Guest updated successfully' });
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ error: 'Failed to update guest' });
  }
};

// Delete guest
const deleteGuest = (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM ldg_mstguestmaster WHERE guest_id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
};

module.exports = {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest
};
