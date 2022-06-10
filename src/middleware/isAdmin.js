module.exports = async function(req, res, next) {
    const isAdmin = req.user.role === 'admin'
    if (!isAdmin) return res.sendStatus(403)
    next()
}