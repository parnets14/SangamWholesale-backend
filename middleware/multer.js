// const multer = require("multer");
// const path = require("path");

// // Storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../uploads/categories"));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpeg|jpg|png|gif|svg/;
//   const mimetype = filetypes.test(file.mimetype);
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//   if (mimetype && extname) {
//     return cb(null, true);
//   }
//   cb("Error: Only image files are allowed!");
// };

// const uploadImage = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: fileFilter,
// });

// module.exports = uploadImage;








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
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

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