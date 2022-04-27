const express = require('express')

const router = express.Router()
const thirdPartyRouter = require('./3rd-party/link_platforms_router.js')
const redditRouter = require('./reddit/reddit_router');
const twitterRouter = require('./twitter/twitter_router')
const attach3rdPartyAuth = require('../middlewares/attach_3rd_party_auth')
const validate3rdPartyAuth = require("../middlewares/validate_3rd_party_auth")
const userRouter = require('./user/user_router')
const { validateAuth } = require('../middlewares/validate_request_auth')
const { retrieveBestPosts } = require("../controllers/reddit/reddit_user_controller")
const { retrieveTimeline } = require('../controllers/twitter/twitter_user_controller')


router.use('/user', userRouter)


router.use('/3rd-party', thirdPartyRouter)
router.use(validateAuth);

router.use(attach3rdPartyAuth);

router.use('/reddit', redditRouter)
router.use('/twitter', twitterRouter)

router.get("/timeline", (req, res, next) => {
    const { reddit_after, twitter_after, limit, count } = req.query;

    const twitterAuth = {
        accessToken: req.session.twitterAccessToken,
        consumer_key: req.session.twitterConsumerKey,
    }
    retrieveTimeline(twitterAuth, limit, twitter_after, async (data) => {
        const redditPosts = await retrieveBestPosts(reddit_after, limit / 2, count / 2)
        if (redditPosts.response) {
            res.status(435);
            next()
        }
        const nextReddit = redditPosts[redditPosts.length - 1].id
        const nextTwitter = data[data.length - 1].id_str


        const posts = redditPosts.concat(data).sort((post1, post2) => {
            const ratingFirst = post1.hasOwnProperty("ups") ? post1.ups : post1.favorite_count;
            const ratingSecond = post2.hasOwnProperty("ups") ? post2.ups : post2.favorite_count;
            return ratingSecond - ratingFirst;

        })

        res.json({
            posts,
            nextReddit,
            nextTwitter
        });

    })
});

router.use(validate3rdPartyAuth);

module.exports = router