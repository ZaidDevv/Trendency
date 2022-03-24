const multer = require('multer');
const path = require('path');
const config = require('./config')

module.exports =
    multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './uploads/');
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * config.MAX_IMAGE_SIZE
        },
    });