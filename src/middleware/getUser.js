const User = require('../models/User')

async function byId(req, res, next) {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: 'User not found'})
        res.user = user
    } catch(err) {
        next(err)
    }
    next()
}

async function byUsername(req, res, next) {
    try {
        const user = await User.findOne({username: req.body.username})
        if(!user) return res.status(404).json({message: 'User not found'})
        req.user = user
    } catch(err) {
        next(err)
    }
    next()
}

module.exports = {
    byId,
    byUsername
}