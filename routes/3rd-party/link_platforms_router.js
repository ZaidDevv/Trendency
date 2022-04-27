const express = require('express');
const router = express.Router()
const queryString = require('query-string');
require('dotenv').config();
const env = process.env;
const createHttpError = require('http-errors');
const { retrieveAuthCredentials, refreshToken, } = require('../../controllers/reddit/reddit_auth_controller.js');
const { persistAuthCredentials } = require('../../controllers/user/user_auth_controller')
const twitterAuthController = require('../../controllers/twitter/twitter_auth_controller.js')


router.get('/twitter/connect', function (req, res, next) {
    try {
        twitterAuthController.authorize((oauthToken, oauthTokenSecret) => {
            res.cookie("oauthRequestToken", oauthToken)
            res.cookie("oauthRequestTokenSecret", oauthTokenSecret)
            req.session.username = req.headers["x-username"]
            res.redirect(`${env.TWITTER_BASE_URL}/oauth/authorize?oauth_token=` + oauthToken);
        })
    }
    catch (e) {
        next(e)
    }
});


router.get('/twitter/callback', function (req, res, next) {

    const { oauthRequestToken, oauthRequestTokenSecret } = req.cookies;

    const verifier = req.query.oauth_verifier;
    try {

        twitterAuthController.authCallback(oauthRequestToken, oauthRequestTokenSecret, verifier, async user => {

            req.session.twitterConsumerKey = user.consumer_key;

            req.session.twitterAccessToken = user.access_token;
            req.session.twitterId = user.id
            await persistAuthCredentials(req.session.username, user.id, "twitter");

            return res.json({ user });
        })
    }
    catch (e) {
        next(e)
    }

});


router.get('/reddit/connect', function (req, res, next) {
    const query = queryString.stringify({
        client_id: env.REDDIT_USER_ID,
        response_type: "code",
        duration: "permanent",
        redirect_uri: `${env.BASE_URL}/api/3rd-party/reddit/callback`,
        state: req.username || "anon",
        scope: 'identity history vote modposts mysubreddits privatemessages read submit subscribe'
    }, { encode: true, sort: false });


    req.session.username = req.headers["x-username"]
    return res.redirect(302, `${env.REDDIT_AUTH_URL}/authorize.compact?${query}`);
});

router.get('/reddit/callback', async function (req, res, next) {
    const { state, code, err } = req.query;
    if (err) {
        return next(createHttpError(401, err))
    }

    if (!code || !state) {
        return next(createHttpError(400, "Something went wrong!"))
    }
    const user = await retrieveAuthCredentials(code);
    req.session.redditRefreshToken = user.auth.refreshToken;
    req.session.redditAccessToken = user.auth.accessToken;
    req.session.redditId = user.id

    const result = await persistAuthCredentials(req.session.username, user.id, "reddit")

    return res.json({ message: "Success, User Successfully linked!", result })

});


router.get('/reddit/refresh', async function (req, res, next) {
    const { refresh_token } = req.body;

    try {
        await refreshToken(refresh_token).then(r => {
            // console.log(r);
            return res.json(r)
        })
    }
    catch (e) {
        next(e)
    }


});

module.exports = router;