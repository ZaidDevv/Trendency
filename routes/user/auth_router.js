const express = require('express');
const router = express.Router()
require('dotenv').config();
const Validator = require('../../middlewares/joi_validator.js')
const createHttpError = require('http-errors')
const { loginUser, registerUser, refreshToken } = require('../../controllers/user/user_auth_controller')
const multer = require('../../utils/multer');
const TwitterUser = require("../../models/TwitterProfile")
const RedditUser = require("../../models/RedditProfile")
const { instance } = require("../../controllers/reddit/reddit_auth_controller")
const jwt = require("jsonwebtoken");
const User = require('../../models/User.js');
const { validateAuth } = require('../../middlewares/validate_request_auth.js');
const twitterClient = require("../../services/twitter_client")


router.post('/login', Validator('login'), async (req, res, next) => {
    const data = req.body;
    try {
        await loginUser(data.username, data.password).then(async (value) => {
            for (act of value.linked_accounts) {
                if (act.platform == "reddit") {
                    const redditUser = await RedditUser.findOne({ id: act.id });
                    req.session.redditId = act.id
                    req.session.redditAccessToken = redditUser.auth.accessToken;
                    instance.defaults.headers.common['authorization'] = "bearer " + redditUser.auth.accessToken;
                    req.session.redditRefreshToken = redditUser.auth.refreshToken
                }
                if (act.platform == "twitter") {
                    const twitterUser = await TwitterUser.findOne({ id: act.id });
                    req.session.twitterId = act.id
                    req.session.twitterAccessToken = twitterUser.auth.access_token;
                    req.session.twitterConsumerKey = twitterUser.auth.consumer_key;

                    twitterClient.setAuth({
                        access_token: req.session.twitterAccessToken,
                        access_token_secret: req.session.twitterConsumerKey
                    })
                }
            }
            res.json(value);
        })

    }
    catch (e) {
        next(e)
    }
});


router.post('/register', multer.single('avatar'), Validator('register'), async (req, res, next) => {
    const data = req.body;
    data.profile_image = req.file;
    try {

        const user = await registerUser(data);
        req.session.user = data.username;
        res.cookie("username", data.username, { overwrite: true })
        return res.json({ ...user })
    }
    catch (e) {
        return next(e)
    }
});

router.post('/refresh_token', async (req, res, next) => {
    const token = req.body.refreshToken

    if (!token) {
        next(createHttpError(422, "Please provide {refreshToken} in the body"));
    }

    try {
        const credentials = await refreshToken(token);
        res.json(credentials);
    }
    catch (e) {
        next(e)
    }
});

router.post('/logout', validateAuth, async (req, res, next) => {
    req.session.destroy((err) => {
        res.json({ message: "Logged out" })
    });

});


module.exports = router;