const router = require('express').Router()
const fs = require('fs')
const Upload = require('../models/Upload')
const {setAuthHeader, isAuth} = require("../middleware")

// SOURCE: https://blog.logrocket.com/streaming-video-in-safari/
router.get('/:upload/:video', setAuthHeader, isAuth, async (req, res, next) => {
    const upload = await Upload.findById(req.params.upload)
    const video = upload.videos.find(video => video.id === req.params.video)
    const filePath = video.path

    req.user.addToWatched(video)

    const options = {}

    let start
    let end

    const range = req.headers.range
    if (range) {
        const bytesPrefix = "bytes="
        if (range.startsWith(bytesPrefix)) {
            const bytesRange = range.substring(bytesPrefix.length)
            const parts = bytesRange.split("-")
            if (parts.length === 2) {
                const rangeStart = parts[0] && parts[0].trim()
                if (rangeStart && rangeStart.length > 0) {
                    options.start = start = parseInt(rangeStart)
                }
                const rangeEnd = parts[1] && parts[1].trim()
                if (rangeEnd && rangeEnd.length > 0) {
                    options.end = end = parseInt(rangeEnd)
                }
            }
        }
    }

    res.setHeader("content-type", "video/mp4")

    fs.stat(filePath, (err, stat) => {
        if (err) {
            console.error(`File stat error for ${filePath}.`)
            console.error(err)
            res.sendStatus(500)
            return;
        }

        let contentLength = stat.size

        if (req.method === "HEAD") {
            res.statusCode = 200
            res.setHeader("accept-ranges", "bytes")
            res.setHeader("content-length", contentLength)
            res.end()
        }
        else {
            let retrievedLength
            if (start !== undefined && end !== undefined) {
                retrievedLength = (end+1) - start
            }
            else if (start !== undefined) {
                retrievedLength = contentLength - start
            }
            else if (end !== undefined) {
                retrievedLength = (end+1)
            }
            else {
                retrievedLength = contentLength
            }

            res.statusCode = start !== undefined || end !== undefined ? 206 : 200

            res.setHeader("content-length", retrievedLength)

            if (range !== undefined) {
                res.setHeader("content-range", `bytes ${start || 0}-${end || (contentLength-1)}/${contentLength}`)
                res.setHeader("accept-ranges", "bytes")
            }

            const fileStream = fs.createReadStream(filePath, options)
            fileStream.on("error", error => {
                console.log(`Error reading file ${filePath}.`)
                console.log(error);
                res.sendStatus(500)
            })

            fileStream.pipe(res)
        }
    })
})

module.exports = router