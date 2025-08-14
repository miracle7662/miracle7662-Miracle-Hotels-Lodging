const validateDistrict = (req, res, next) => {
  const { distrcitname, ditcrictcode, stateid, description } = req.body;
  const errors = {};

  // Validate district name
  if (!distrcitname || !distrcitname.trim()) {
    errors.distrcitname = 'District name is required';
  } else if (distrcitname.trim().length < 2) {
    errors.distrcitname = 'District name must be at least 2 characters';
  }

  // Validate district code
  if (!ditcrictcode || !ditcrictcode.trim()) {
    errors.ditcrictcode = 'District code is required';
  } else if (ditcrictcode.trim().length !== 2) {
    errors.ditcrictcode = 'District code must be exactly 2 characters';
  } else if (!/^[A-Z0-9]+$/.test(ditcrictcode.trim())) {
    errors.ditcrictcode = 'District code must be alphanumeric (uppercase)';
  }

  // Validate state ID
  if (!stateid) {
    errors.stateid = 'State is required';
  } else if (isNaN(stateid) || stateid <= 0) {
    errors.stateid = 'Invalid state ID';
  }

  // Validate description (optional)
  if (description && description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({ error: 'Invalid limit (1-100)' });
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    search: search.trim()
  };

  next();
};

module.exports = {
  validateDistrict,
  validatePagination
};
