const express = require('express');
const passport = require('../../services/passport_twitter.js');
const router = express.Router()
const queryString = require('query-string');
require('dotenv').config();
const env = process.env;
const axios = require('axios');
const createHttpError = require('http-errors');
const { retrieveAuthCredentials } = require('../../controllers/reddit/reddit_auth_controller.js');

router.get('/twitter', passport.authenticate('oauth2'));

router.get('/twitter/callback',
    passport.authenticate('oauth2', { failureRedirect: '/' }),
    function (req, res, next) {
        if (!req.headers['X-User-ID'])
            return next(createHttpError(422, "Please provide internalId in the body"))
        const { user } = req;
        return res.json({
            result: user
        });

    });


router.post('/twitter/refresh', function (req, res) {
    //TODO: Implement twitter oauth refresh

})

router.get('/reddit', function (req, res, next) {
    // if (!req.headers['X-User-ID'])
    //     return next(createHttpError(422, "Please provide internalId in the body"))
    const query = queryString.stringify({
        client_id: env.REDDIT_USER_ID,
        response_type: "code",
        redirect_uri: `${env.BASE_URL}/api/3rd-party/reddit/callback`,
        state: req.headers['X-User-ID'] || "test",
        duration: "permanent",
        scope: 'identity history modposts mysubreddits privatemessages read submit subscribe'
    }, { encode: false, sort: false })


    return res.redirect(301, `${env.REDDIT_AUTH_URL}/authorize?${query}`)
});

router.get('/reddit/callback', async function (req, res, next) {
    const { state, code, err } = req.query;

    if (err) {
        return next(createHttpError(401, err))
    }

    if (!code || !state) {
        return next(createHttpError(400, "Something went wrong!"))
    }

    const credentials = await retrieveAuthCredentials(code);

    return res.json({ message: "Success, User Successfully linked!", credentials: credentials })

});


router.get('/reddit/refresh', async function (req, res, next) {
    const { refresh_token } = req.body;
    try {
        const credentials = await axios.post(`${env.REDDIT_BASE_URL}/access_token`, queryString.stringify({
            refresh_token,
            grant_type: "refresh_token"
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: env.REDDIT_USER_ID,
                password: ""
            }
        })
        res.json(credentials.data)
    }
    catch (e) {
        return next(createHttpError(400, e));
    }

});

module.exports = router;