const express = require('express');
const router = express.Router()
require('dotenv').config();
const { loginUser, registerUser, refreshToken } = require('../../controllers/user/user_auth_controller')
const Validator = require('../../middlewares/joi_validator.js')
const createHttpError = require('http-errors')
const multer = require('../../utils/multer')

router.post('/login', Validator('login'), async (req, res, next) => {
    const data = req.body;
    try {
        const user = await loginUser(data.username, data.password)
        return res.json({ user });
    }
    catch (e) {
        return next(e);
    }
});


router.post('/register', multer.single('avatar'), Validator('register'), async (req, res, next) => {
    const data = req.body;
    data.profile_image = req.file;
    try {
        const user = await registerUser(data);
        return res.json({ user })
    }
    catch (e) {
        return next(e)
    }
});


router.get('/image', async (req, res, next) => {
    const path = "../../../uploads/avatar-1648076994481.png"

    res.send(`You have uploaded this image: <hr/><img src="${path}" width="500"><hr /><a href="./">Upload another image</a>`);

});



router.post('/refresh_token', async (req, res, next) => {
    const token = req.body.refreshToken

    if (!token) {
        return next(createHttpError(422, "Please provide {refreshToken} in the body"));
    }

    try {
        const credentials = await refreshToken(token);
        return res.json(credentials);
    }
    catch (e) {
        return next(e)
    }
});


module.exports = router;