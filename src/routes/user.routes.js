const router = require('express').Router()
const User = require('../models/User')
const {getUser, isAuth, isAdmin} = require('../middleware')

router.get('/', isAuth, isAdmin, async(req, res, next) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch(err) {
        next(err)
    }
})

router.get('/me', isAuth, async(req, res, next) => {
    try {
        res.json(req.user.toAuthJSON())
    } catch(err) {
        next(err)
    }
})

router.post('/', isAuth, isAdmin, async(req, res, next) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role
    })

    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch(err) {
        next(err)
    }
})

router.delete('/:id', isAuth, isAdmin, getUser.byId, async(req, res, next) => {
    try {
        await res.user.remove()
        res.sendStatus(204)
    } catch(err) {
        next(err)
    }
})

module.exports = router