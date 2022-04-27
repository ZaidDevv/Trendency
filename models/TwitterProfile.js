const mongoose = require('mongoose');
const { Schema } = mongoose;
var findOrCreate = require('mongoose-findorcreate')

const twitterUser = new Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    id: {
        type: String,
        index: true
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
    auth:
    {
        consumer_key: {
            type: String,
            required: true
        },
        access_token: {
            type: String,
            required: true
        },
    },

});

twitterUser.plugin(findOrCreate);

module.exports = mongoose.model('twitterProfiles', twitterUser)