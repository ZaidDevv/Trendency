const axios = require('axios');
require('dotenv').config();
const env = process.env;
const createHttpError = require('http-errors');

const RedditUser = require('../../models/RedditProfile');
const queryString = require('query-string');

const instance = axios.create({
    baseURL: env.REDDIT_AUTH_URL,
    timeout: 5000,
});

const retrieveAuthCredentials = async function (code) {

    try {
        const credentials = await instance.post(`${env.REDDIT_AUTH_URL}/access_token`, queryString.stringify({
            code,
            redirect_uri: `${env.BASE_URL}/api/3rd-party/reddit/callback`,
            grant_type: "authorization_code"
        }), {
            auth: {
                username: env.REDDIT_USER_ID,
                password: ""
            }
        })

        const user = await persistUser(credentials.data.access_token, credentials.data.refresh_token)
        return user;
    }
    catch (e) {
        console.log(e);
    }

}


const persistUser = async function (accessToken, refreshToken) {
    instance.defaults.headers.common['authorization'] = "bearer " + accessToken;
    const userDetails = await instance.get(`${env.REDDIT_BASE_URL}/api/v1/me`);
    var user = await RedditUser.findOne({ id: userDetails.data.id })

    if (!user) {
        user = await RedditUser.create({
            id: userDetails.data.id,
            username: userDetails.data.name,
            description: userDetails.data.description,
            memberSince: new Date(userDetails.data.created * 1000),
            auth: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            }
        })
    }
    else {
        user.auth.accessToken = accessToken
        user.auth.refreshToken = refreshToken
        user.save()
    }

    return user;

}


const refreshToken = async function (refresh_token) {
    if (!refresh_token)
        createHttpError(422, "Please provide {refresh_token} in the body");
    try {
        const credentials = await axios.post(`${env.REDDIT_AUTH_URL}/access_token`, queryString.stringify({
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

        // console.log(credentials.data)
        return credentials.data
    }
    catch (e) {
        return createHttpError(400, e);
    }
}
module.exports = {
    instance,
    retrieveAuthCredentials,
    persistUser,
    refreshToken
}