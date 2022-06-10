const router = require('express').Router()
const stream = require('./stream.routes')
const auth = require('./auth.routes')
const users = require('./user.routes')
const uploads = require('./upload.routes')

router.use('/uploads', uploads)
router.use('/stream', stream)
router.use('/auth', auth)
router.use('/users', users)

router.use(function(req, res, next) {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

router.use((err, req, res, next) => {
    if(process.env.NODE_ENV !== 'production') console.log(err.stack)

    res.status(err.status || 500)
    res.json({
        'errors': {
            message: err.message,
            error: {}
        }
    })
})

module.exports = router