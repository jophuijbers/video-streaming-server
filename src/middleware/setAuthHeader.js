module.exports = async function(req, res, next) {
    if (!req.query.token) return res.sendStatus(401)
    req.headers['authorization'] = `Bearer ${req.query.token}`
    next()
}