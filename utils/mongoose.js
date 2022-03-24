const mongoose = require('mongoose');
require('dotenv').config()

try {
    mongoose.connect(`${process.env.DB_URI}`).then(() => {
        console.log("DB is live!")
    });
} catch (error) {
    console.log(error);
}

mongoose.connection.on('error', err => {
    console.log(err)
});

module.exports = mongoose;