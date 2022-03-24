const mongoose = require('mongoose');
const { Schema } = mongoose;
var findOrCreate = require('mongoose-findorcreate')

const redditUser = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    id: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    profileImageUrl: {
        type: String
    },
    totalKarma: Number,
    description: String,
    memberSince: {
        type: Date
    },
    auth: {
        accessToken: String,
        refreshToken: String,
    }
});

redditUser.plugin(findOrCreate);

module.exports = mongoose.model('redditProfiles', redditUser)