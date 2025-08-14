const path = require('path');
const fs = require('fs');
const multer = require('multer');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Base uploads directory
const uploadsBaseDir = path.join(__dirname, '..', 'uploads');
ensureDirectoryExists(uploadsBaseDir);

// Guests subdirectory
const guestsUploadDir = path.join(uploadsBaseDir, 'guests');
ensureDirectoryExists(guestsUploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, guestsUploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safeOriginal}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept common image types; extend as needed
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = {
  upload,
  uploadsBaseDir,
  guestsUploadDir,
};


