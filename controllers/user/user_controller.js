
const User = require('../../models/User')
const createHttpError = require('http-errors')


const getUserById = async function (id) {

    try {
        const user = User.findOne({ id });
        return user;
    }
    catch (e) {
        throw e;
    }
}

const updateUserById = async function (id, payload) {

    try {
        const user = await User.findOneAndUpdate({ id }, payload);
        return user;
    }
    catch (e) {
        throw e;
    }
}


module.exports = {
    getUserById,
    updateUserById
}