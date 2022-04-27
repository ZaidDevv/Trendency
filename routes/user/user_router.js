const express = require('express')
const createHttpError = require('http-errors');
const router = express.Router();
// const { validateAuth } = require('../../middlewares/validate_request_auth.js');
const userController = require('../../controllers/user/user_controller')
const authRouter = require('../user/auth_router.js');
router.use('/auth', authRouter)

// router.use(validateAuth);


router.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    if (!id)
        return next(createHttpError(422, "Please provide {id} as a request param"))

    try {
        const user = await userController.getUserById(id);
        if (!user || user === null) {
            return next(createHttpError(404, "User Not found"))
        }
        res.json(user);
    }
    catch (e) {
        next(e);
    }

})

router.put('/:id', async (req, res, next) => {
    const id = req.params.id;
    const payload = req.body;

    if (!payload) {
        return next(createHttpError(422, "Please provide a body to the request"))
    }
    if (!id)
        return next(createHttpError(422, "Please provide {id} as a request param"))

    try {
        const user = await userController.updateUserById(id, payload)
        if (!user || user === null)
            return next(createHttpError(404, "User Not found"))

        return res.json(user)
    }
    catch (e) {
        return next(e);
    }

})


router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;
    const payload = req.body;

    if (!id)
        return next(createHttpError(422, "Please provide {id} as a request param"))

    try {
        const user = await userController.deleteUserById(id, payload)
        if (!user || user === null)
            return next(createHttpError(404, "User Not found"))

        return res.json(user)
    }
    catch (e) {
        return next(e);
    }

});


module.exports = router