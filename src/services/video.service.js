const { getVideoDurationInSeconds } = require('get-video-duration')
const path = require('path')

async function saveVideosWithFiles(videos, location) {
    const uploaded = []
    if(!Array.isArray(videos)) videos = [videos]
    for (const video of videos) {
        const name = path.parse(video.name).name
        const videoPath = `./videos/${location}/${video.name}`
        await video.mv(videoPath).then(() => {
            uploaded.push({name: name, path: videoPath})
        })
    }
    return uploaded
}

function saveVideosByName(videos, location) {
    const uploaded = []
    if(!Array.isArray(videos)) videos = [videos]
    videos.forEach(video => {
        const name = path.parse(video).name
        const videoPath = `./videos/${location}/${video}`
        uploaded.push({name: name, path: videoPath})
    })
    return uploaded
}

async function getDuration(video) {
    const SECONDS = await getVideoDurationInSeconds(`./videos/${video}`)
    const formatted = new Date(SECONDS * 1000).toISOString().substring(11, 16)
    if (formatted.split(':')[0] === '00') {
        return formatted.split(':')[1] + 'm'
    }
    return formatted + 'h'
}

module.exports = {
    saveVideosWithFiles,
    saveVideosByName,
    getDuration
}