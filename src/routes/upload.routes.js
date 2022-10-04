const router = require('express').Router()
const fileUpload = require('express-fileupload')
const moment = require('moment')
const Upload = require('../models/Upload')
const {saveImage} = require('../services/image.service')
const {saveVideos, updateVideos} = require('../services/video.service')
const {isAuth, isAdmin} = require('../middleware')

router.use(fileUpload({
    createParentPath: true
}))

router.get('/', isAuth, async(req, res, next) => {
    try {
        let filters = {}
        if (req.query.search) filters = {
            $or: [
                { name: {$regex: req.query.search, $options: 'i'} },
                { tags: {$regex: req.query.search, $options: 'i'} }
            ]
        }
        else if (req.query.tag === 'recent') filters = {
            updatedAt: { $gt: moment().subtract(7, "d").toDate() }
        }
        else if (req.query.tag) filters = { tags: req.query.tag }

        const uploads = await Upload.find(filters).sort({ updatedAt: -1 })
        res.json(uploads)
    } catch(err) {
        next(err)
    }
})

router.get('/:id', isAuth, async(req, res, next) => {
    try {
        const upload = await Upload.findById(req.params.id)
        res.json(upload.fullObject(req.user))
    } catch(err) {
        next(err)
    }
})

router.post('/', isAuth, isAdmin, async(req, res, next) => {
    try {
        const upload = new Upload({
            name: req.body.name,
            creator: req.user.toJSONCreator(),
            videos: saveVideos(req.body.name)
        })

        if(req.body.tags) upload.tags = req.body.tags.split(' ')
        if(req.files && req.files.image) upload.image = saveImage(req.body.name, req.files.image)

        const newUpload = await upload.save()
        res.json(newUpload)
    } catch(err) {
        next(err)
    }
})

router.patch('/:id', isAuth, isAdmin, async(req, res, next) => {
    try {
        const upload = await Upload.findById(req.params.id)
        if (req.body.name) {
            upload.name = req.body.name
            upload.videos = updateVideos(upload)
        }
        if (req.files && req.files.image) upload.image = saveImage(req.body.name, req.files.image)
        if(req.body.tags) upload.tags = req.body.tags.split(' ')

        const newUpload = await upload.save()
        res.json(newUpload)
    } catch(err) {
        next(err)
    }
})

router.delete('/:id', isAuth, isAdmin, async(req, res, next) => {
    try {
        const upload = await Upload.findById(req.params.id)
        await upload.delete()
        res.sendStatus(204)
    } catch(err) {
        next(err)
    }
})

module.exports = router