const mongoose = require('mongoose');
const { Schema } = mongoose;
var findOrCreate = require('mongoose-findorcreate')
const bcrypt = require("bcryptjs")

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    profile_image: {
        type: String
    },
    password: {
        type: String
    },
    linked_accounts: [],
    id: {
        index: true,
        type: String,
        required: true
    },

    auth: {
        accessToken: String,
        refreshToken: String,
    }
}, { timestamps: true });

userSchema.pre("save", function (next) {
    const user = this

    if (this.isModified("password") || this.isNew) {
        bcrypt.genSalt(10, function (saltError, salt) {
            if (saltError) {
                return next(saltError)
            } else {
                bcrypt.hash(user.password, salt, function (hashError, hash) {
                    if (hashError) {
                        return next(hashError)
                    }

                    user.password = hash
                    next()
                })
            }
        })
    } else {
        return next()
    }
})

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('users', userSchema)