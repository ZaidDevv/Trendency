const axios = require('axios');
require('dotenv').config();
const env = process.env;
const RedditUser = require('../../models/RedditProfile');
const queryString = require('query-string');

const retrieveAuthCredentials = async function (code) {
    const credentials = await axios.post(`${env.REDDIT_AUTH_URL}/access_token`, queryString.stringify({
        code,
        redirect_uri: `${env.BASE_URL}/api/3rd-party/reddit/callback`,
        grant_type: "authorization_code"
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: env.REDDIT_USER_ID,
            password: ""
        }
    }).then(async (val) => await persistUser(val.data.access_token, val.data.refresh_token))

    return credentials;
}


const persistUser = async function (accessToken, refreshToken) {
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` }
    };
    const userDetails = await axios.get(`${env.REDDIT_BASE_URL}/me`, config);

    const user = RedditUser.findOrCreate({ id: userDetails.data.id }, {
        id: userDetails.data.id,
        username: userDetails.data.name,
        auth: {
            accessToken,
            refreshToken
        },
        description: userDetails.data.description,
        memberSince: new Date(userDetails.data.created * 1000)
    })

    return user;

}




module.exports = {
    retrieveAuthCredentials,
    persistUser,
}