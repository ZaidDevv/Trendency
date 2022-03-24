
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function validateAuth(req, res, next) {
    const accessToken = req.headers['authorization']


    if (!accessToken) {
        return next(createHttpError(401, "No Access Token Provided"))
    }
    try {
        var formattedToken = accessToken.replace("Bearer ", "")
        jwt.verify(formattedToken, process.env.JWT_SECRET);
    }
    catch (e) {
        throw createHttpError(500, e)
    }

    return next()
};