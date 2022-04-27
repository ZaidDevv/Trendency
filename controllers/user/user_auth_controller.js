
require('dotenv').config();
const config = require('../../utils/config.js')
const User = require('../../models/User.js');
const env = process.env;
const bcrypt = require('bcryptjs');
const redditContorller = require('../../controllers/reddit/reddit_user_controller')
const TwitterUser = require('../../models/TwitterProfile')

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

async function loginUser(username, pass) {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            throw createHttpError(404, "User not found!")
        }

        const accessToken = jwt.sign({ id: user.id, username, email: user.email, is_verified: user.is_verified }, env.JWT_SECRET, { expiresIn: config.EXPIRES_IN })
        const refreshToken = jwt.sign({ id: user.id, username, email: user.email, is_verified: user.is_verified }, env.JWT_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN })

        const isloggedIn = await bcrypt.compare(pass, user.password);

        if (!isloggedIn) {
            throw createHttpError(401, "Wrong Username/Password")
        }

        user.save();
        const { password, ...other } = user._doc;

        other.refreshToken = refreshToken;
        other.accessToken = accessToken;

        return other;
    }
    catch (e) {
        console.log(e);
        throw createHttpError(500, e)
    }
}

async function registerUser(user) {
    const id = uuidv4();
    const username = user.username;

    try {
        const accessToken = jwt.sign({ id: id, username, email: user.email, is_verified: false }, env.JWT_SECRET, { expiresIn: config.EXPIRES_IN })
        const refreshToken = jwt.sign({ id: id, username, email: user.email, is_verified: false }, env.JWT_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN })
        const created = await User.create({
            username: user.username,
            email: user.email,
            password: user.password,
            id,
            is_verified: false,
            profile_image: user.profile_image ? `${env.BASE_URL}/uploads/${user.profile_image.filename}` : `${env.BASE_URL}/uploads/default.png`
        })

        const { password, ...others } = created._doc;

        others.accessToken = accessToken
        others.refreshToken = refreshToken
        return others;
    }
    catch (e) {
        throw e
    }
}

async function refreshToken(refresh_token) {

    try {
        const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
        const user = await User.findOne({
            username: decoded.username
        })

        if (!user) {
            throw createHttpError(404, "User not found")
        }

        auth = {
            accessToken: jwt.sign({ id: user.id, email: user.email, username: user.username, is_verified: user.is_verified }, env.JWT_SECRET, { expiresIn: config.EXPIRES_IN }),
            refreshToken: jwt.sign({ id: user.id, email: user.email, username: user.username, is_verified: user.is_verified }, env.JWT_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN })
        }
        return auth;
    }
    catch (e) {
        console.log(e);
        throw createHttpError(402, "Refresh Token Expired or Invalid");
    }

}

const retrieve3rdPartyAuth = async function (linked_accounts) {
    var auth = []
    for (act of linked_accounts) {
        if (act.platform == "reddit" && act.id != null) {
            const user = await redditContorller.getUserById(act.id);
            auth.push({
                type: "reddit",
                accessToken: user.auth.accessToken,
                refreshToken: user.auth.refreshToken
            })
        }
        if (act.platform == "twitter" && act.id != null) {
            const user = await TwitterUser.findOne({ id: act.id });
            auth.push({
                type: "twitter",
                consumer_key: user.auth.consumer_key,
                accessToken: user.auth.access_token
            })
        }
        //TODO: ADD REST OF THE PLATFORMS
    }
    return auth;
}

async function persistAuthCredentials(username, id, platform) {
    const user = await User.findOne({ username });
    if (user.linked_accounts == null) {
        user.linked_accounts = [];
    }
    else if (user.linked_accounts.some(e => e.platform == platform)) {
        return;
    }
    if (user.linked_accounts.length >= 2) {
        user.is_verified = true;
    }

    user.linked_accounts.push({ platform, id });
    await user.save();

    return user;
}

module.exports = {
    loginUser,
    retrieve3rdPartyAuth,
    registerUser,
    refreshToken,
    persistAuthCredentials
}