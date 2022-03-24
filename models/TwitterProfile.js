const mongoose = require('mongoose');
const { Schema } = mongoose;
var findOrCreate = require('mongoose-findorcreate')

const twitterUser = new Schema({
    username: {
        type: String,
        required: true
    },
    id: {
        type: String,
    },
    profileImageUrl: {
        type: String
    },
    location: {
        type: String
    },
    verified: {
        type: Boolean
    },
    protected: {
        type: Boolean
    },
    description: {
        type: String
    },
    userStats: {
        followers_count: Number,
        following_count: Number,
        tweet_count: Number,
        listed_count: Number
    },
    memberSince: {
        type: Date
    },
    auth: {
        accessToken: String,
        refreshToken: String,
    }
});

twitterUser.plugin(findOrCreate);

module.exports = mongoose.model('twitterProfiles', twitterUser)