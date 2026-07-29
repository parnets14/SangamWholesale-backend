const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUploader = (folder) => {
  // Create the uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);

  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });

  const fileFilter = (req, file, cb) => {
    // Allow common image formats including modern formats
  const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'image/avif',
      'image/bmp',
      'image/tiff',
      'image/x-icon'
    ];
    
    const allowedExtensions = /jpeg|jpg|png|gif|svg|webp|avif|bmp|tiff|ico/;
    
    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mimetype = file.mimetype.toLowerCase();
    
    // Check if mimetype is in allowed list
    const mimetypeValid = allowedMimeTypes.includes(mimetype);
    // Check if extension is valid
    const extnameValid = allowedExtensions.test(extname);

    if (mimetypeValid && extnameValid) {
      return cb(null, true);
    }
    
    // Provide helpful error message
    const errorMsg = `Error: Only image files are allowed! Supported formats: JPEG, JPG, PNG, GIF, SVG, WEBP, AVIF, BMP, TIFF. Received: ${mimetype} (${extname || 'no extension'})`;
    cb(new Error(errorMsg));
  };

  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter,
  });
};

module.exports = createUploader;
