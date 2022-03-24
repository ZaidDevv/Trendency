const Joi = require('joi');

const registerValidation = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().required().min(8),
    email: Joi.string().required().email()
})

module.exports = registerValidation