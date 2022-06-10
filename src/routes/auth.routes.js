const router = require('express').Router()
const {getUser} = require('../middleware')

router.post('/login', getUser.byUsername, async(req, res, next) => {
    try {
        const auth = await req.user.comparePassword(req.body.password)
        if (!auth) return res.sendStatus(401)
        res.send(req.user.toAuthJSON())
    } catch(err) {
        next(err)
    }
})

module.exports = router