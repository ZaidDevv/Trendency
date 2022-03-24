
require('dotenv').config();
const config = require('../../utils/config.js')
const User = require('../../models/User.js');
const env = process.env;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');
const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

async function loginUser(username, password) {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            throw Error("User not found!")
        }

        const token = jwt.sign({ username, "email": user.email }, env.JWT_SECRET, { expiresIn: config.EXPIRES_IN })
        const refreshToken = jwt.sign({ username, "email": user.email }, env.JWT_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN })

        user.auth = {
            accessToken: token,
            refreshToken
        }
        const isloggedIn = await bcrypt.compare(password, user.password);

        if (!isloggedIn) {
            throw Error("Wrong Username/Password Combination!")
        }

        user.save();
        return user;

    }
    catch (e) {
        throw Error(e)
    }
}

async function registerUser(user) {
    const accessToken = jwt.sign(user, env.JWT_SECRET, { expiresIn: config.EXPIRES_IN })
    const refreshToken = jwt.sign(user, env.JWT_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN })

    const created = await User.create({
        username: user.username,
        email: user.email,
        password: user.password,
        id: uuidv4(),
        auth: {
            accessToken,
            refreshToken
        },
        profile_image: `${env.BASE_URL}/uploads/${user.profile_image.filename}`
    }).catch(() => { throw createHttpError(409, "User Exists") })

    return created;
}

async function refreshToken(refresh_token) {
    if (Date.now() >= Date(jwt.decode(refresh_token).exp * 1000)) {
        return res.status(400).json({ message: "Refresh token has expired" });
    }
    const user = await User.findOne({
        "auth.refreshToken": refresh_token
    })

    if (!user) {
        throw createHttpError(404, "User not found / Invalid Token")
    }

    user.auth = {
        accessToken: jwt.sign({ id: user.id, email: user.email, username: user.username }, config.EXPIRES_IN),
        refreshToken: jwt.sign({ id: user.id, email: user.email, username: user.username }, config.REFRESH_EXPIRES_IN)
    }

    user.save();

    return user.auth;

}

module.exports = {
    loginUser,
    registerUser,
    refreshToken
}