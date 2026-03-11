const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/videos");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Extract original extension
        const ext = path.extname(file.originalname);
        // Create unique filename: fieldname-timestamp.ext
        cb(null, file.fieldname + "-" + Date.now() + ext);
    },
});

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /mp4|mkv|avi|mov/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Videos Only! (mp4, mkv, avi, mov)"));
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000 * 1024 * 1024 }, // 1GB limit for videos
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
