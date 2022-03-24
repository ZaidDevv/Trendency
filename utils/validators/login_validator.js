const Joi = require('joi');

const loginValidation = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().required(),
});

module.exports = loginValidation;