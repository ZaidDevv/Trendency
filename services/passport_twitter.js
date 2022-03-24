const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2');
const User = require("../models/TwitterProfile.js");
const queryString = require('query-string');
const currentEnv = process.env;
const randomstring = require("randomstring");
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const authUrl = currentEnv.TWITTER_AUTH_URL + queryString.stringify({
    response_type: 'code',
    code_challenge: randomstring.generate(),
    code_challenge_method: "plain",
}, { encode: false, sort: false })

const strategy = new OAuth2Strategy({
    authorizationURL: authUrl,
    tokenURL: `${currentEnv.TWITTER_BASE_URL}/oauth2/token`,
    clientID: currentEnv.TWITTER_CLIENT_ID,
    clientSecret: currentEnv.TWITTER_CLIENT_SECRET,
    pkce: true,
    passReqToCallback: true,
    skipUserProfile: false,
    state: randomstring.generate(),
    scope: ["users.read", "tweet.read", "follows.read", "follows.write", "mute.write", "offline.access"],
    callbackURL: "http://localhost:4080/api/3rd-party/twitter/callback"
},
    async function (req, accessToken, refreshToken, params, profile, verified) {
        const internalId = req.headers['X-User-ID']

        const user = await User.findOrCreate({ id: profile.id }, {
            username: profile.username,
            id: profile.id,
            auth: {
                accessToken,
                refreshToken
            },
            verified: profile.verified,
            description: profile.description,
            member_since: profile.created_at,
            profile_image_url: profile.profile_image_url,
            location: profile.location,
            protected: profile.protected,
            userStats: {
                followers_count: profile.public_metrics.followers_count,
                following_count: profile.public_metrics.following_count,
                tweet_count: profile.public_metrics.tweet_count,
                listed_count: profile.public_metrics.listed_count
            },
            auth: {
                accessToken,
                refreshToken
            }
        });

        if (!user)
            return verified(null, false);

        else
            return verified(null, user)
    }
)

strategy.userProfile = async function (accessToken, done) {
    const client = new TwitterApi(accessToken);

    const profile = await client.v2.me({ 'user.fields': ['id', 'created_at', 'name', 'username', 'protected', 'verified', 'withheld', 'profile_image_url', 'location', 'url', 'description', 'entities', 'pinned_tweet_id', 'public_metrics'] });
    return done(null, profile.data)
}

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


passport.use('oauth2', strategy);


module.exports = passport;