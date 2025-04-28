const multer = require("multer");
const path = require("path");

const createUploader = (folder) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, `../uploads/${folder}`));
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
    const filetypes = /jpeg|jpg|png|gif|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Only image files are allowed!");
  };

  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter,
  });
};

module.exports = createUploader;

// const multer = require("multer");
// const path = require("path");

// const createUploader = (folder) => {
//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname, `../uploads/${folder}`));
//     },
//     filename: function (req, file, cb) {
//       // Sanitize the original filename (remove spaces and special chars)
//       const sanitizedName = file.originalname
//         .toLowerCase()
//         .replace(/\s+/g, "-") // Replace spaces with -
//         .replace(/[^a-z0-9\-\.]/g, "") // Remove non-alphanumeric chars except - and .
//         .replace(/\-+/g, "-") // Replace multiple - with single -
//         .replace(/^\-+|\-+$/g, ""); // Remove - from start and end

//       // Use sanitized name directly
//       cb(null, sanitizedName);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|gif|svg/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb("Error: Only image files are allowed!");
//   };

//   return multer({
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//     fileFilter: fileFilter,
//   });
// };

// module.exports = createUploader;
