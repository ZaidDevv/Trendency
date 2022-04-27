
const User = require('../../models/User')

const getUserById = async function (id) {

    try {
        const user = await User.findOne({ id });

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

const deleteUserById = async function (id, payload) {

    try {
        const user = await User.deleteUserById({ id });
        return {
            message: "Success",
            details: "User Deleted!"
        };

    }
    catch (e) {
        throw e;
    }
}


module.exports = {
    getUserById,
    updateUserById,
    deleteUserById
}