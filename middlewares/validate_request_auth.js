
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken')
require('dotenv').config()

function validateAuth(req, res, next) {
    const accessToken = req.headers['authorization']

    if (!accessToken || accessToken.isEmpty) {
        next(createHttpError(401, "No Access Token Provided"))
    }
    try {
        var formattedToken = accessToken.replace("Bearer ", "")
        const decoded = jwt.verify(formattedToken, process.env.JWT_SECRET)

        req.cookies.accessToken = formattedToken
        req.username = decoded.username;
        next();
    }
    catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            req.username = e.username
            req.expiredAt = e.expiredAt

            next(createHttpError(401, e))
        }
        else {
            next(e)
        }
    }

};

module.exports = {
    validateAuth
}