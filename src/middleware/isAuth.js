const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async function(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    try {
        const jwtPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = await User.findById(jwtPayload.id)
    } catch (err) {
        return res.sendStatus(403)
    }
    next()
}