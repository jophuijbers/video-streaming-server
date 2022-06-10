const router = require('express').Router()
const fs = require('fs')
const {isAuth} = require('../middleware')
const Upload = require('../models/Upload')

router.get('/:upload/:video', async(req, res, next) => {
    try {
        const upload = await Upload.findById(req.params.upload)
        const video = upload.videos.find(video => video.id === req.params.video)
        
        const videoRange = req.headers.range
        const videoPath = video.path
        const videoSize = fs.statSync(videoPath).size

        if (videoRange) {
            const CHUNK_SIZE = 10 ** 6
            const start = Number(videoRange.replace(/\D/g, ''))
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

            const contentLength = end - start + 1
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': 'video/mp4'
            }

            res.writeHead(206, headers)
            const videoStream = fs.createReadStream(videoPath, { start, end })
            return videoStream.pipe(res)
        }

        const headers = {
            'Content-Length': videoSize,
            'Content-Type': 'video/mp4'
        }
        res.writeHead(200, headers)
        fs.createReadStream(videoPath).pipe(res)
    } catch(err) {
        next(err)
    }
})

module.exports = router