const getUser = require('./getUser')
const isAuth = require('./isAuth')
const isAdmin = require('./isAdmin')
const setAuthHeader = require('./setAuthHeader')

module.exports = {
    getUser,
    isAuth,
    isAdmin,
    setAuthHeader
}