const router = require('express').Router()
const fileUpload = require('express-fileupload')
const Upload = require('../models/Upload')
const {saveImage} = require('../services/image.service')
const {saveVideosWithFiles, saveVideosByName} = require('../services/video.service')
const {isAuth, isAdmin} = require('../middleware')

router.use(fileUpload({
    createParentPath: true
}))

router.get('/', isAuth, async(req, res, next) => {
    try {
        const uploads = await Upload.find()
        res.json(uploads)
    } catch(err) {
        next(err)
    }
})

router.get('/:id', isAuth, async(req, res, next) => {
    try {
        const upload = await Upload.findById(req.params.id)
        res.json(upload)
    } catch(err) {
        next(err)
    }
})

router.post('/', isAuth, isAdmin, async(req, res, next) => {
    if(!req.files.videos && !req.body.videos) res.status(400).json({message: 'No videos provided'})

    const upload = new Upload({
        name: req.body.name,
        creator: req.user.toJSONCreator()
    })

    try {
        if(req.files.image) upload.image = saveImage(res, req.files.image)
        if(req.files.videos) upload.videos = await saveVideosWithFiles(req.files.videos, req.body.name)
        else if(req.body.videos) upload.videos = saveVideosByName(req.body.videos, req.body.name)
        const newUpload = await upload.save()
        res.json(newUpload)
    } catch(err) {
        next(err)
    }
})

module.exports = router