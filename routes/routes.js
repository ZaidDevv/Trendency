const express = require('express')

const router = express.Router()
const thirdPartyRouter = require('./3rd-party/link_platforms_router.js')
const authRouter = require('./user/auth_router.js');
const userRouter = require('./user/user_router.js');

router.use('/user/auth', authRouter)
router.use('/3rd-party', thirdPartyRouter)
router.use('/user', userRouter)


module.exports = router