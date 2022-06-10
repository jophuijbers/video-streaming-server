const { getVideoDurationInSeconds } = require('get-video-duration')
const path = require('path')
const fs = require('fs')

function saveVideos(directory) {
    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})

    const dir = `./videos/${directory}`
    const contents = fs.readdirSync(dir).sort(collator.compare)

    let videos = []
    contents.forEach((entry) => {
        let stats = fs.statSync(`${dir}/${entry}`)
        if (stats.isFile()) {
            if (path.extname(entry) !== '.mp4') return
            videos.push({
                name: path.parse(entry).name,
                path: `${dir}/${entry}`
            })
        }
        else if (stats.isDirectory()) {
            let contents = fs.readdirSync(`${dir}/${entry}`).sort(collator.compare)
            contents.forEach((entry2) => {
                if (path.extname(entry2) !== '.mp4') return
                videos.push({
                    name: path.parse(entry2).name,
                    path: `${dir}/${entry}/${entry2}`
                })
            })
        }
    })
    return videos
}

async function getDuration(videoPath) {
    const SECONDS = await getVideoDurationInSeconds(videoPath)
    let duration = new Date(SECONDS * 1000).toISOString().substring(11, 16)
    while(duration.charAt(0) === '0' || duration.charAt(0) === ':') {
        duration = duration.substring(1);
    }
    duration += duration.length <= 2 ? 'm' : 'h'
    return duration
}

module.exports = {
    saveVideos,
    getDuration
}