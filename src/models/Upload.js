const mongoose = require("mongoose")
const {getDuration} = require('../services/video.service')
const {getImagePath} = require('../services/image.service')

const VideoSchema = mongoose.Schema({
	name: String,
    path: String,
    duration: String
})

VideoSchema.pre('save', async function() {
    if(this.duration) return
    this.duration = await getDuration(this.path)
})

const UploadSchema = mongoose.Schema({
	name: String,
    image: String,
    videos: [VideoSchema],
    tags: [String],
    creator: Object,
}, {timestamps: true})

UploadSchema.methods.toJSON = function() {
    return {
        id: this._id,
        name: this.name,
        imagePath: getImagePath(this.image),
        creator: this.creator,
        videos: this.videos,
        tags: this.tags,
        length: this.videos.length,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

UploadSchema.methods.fullObject = function(user) {
    return {
        id: this._id,
        name: this.name,
        imagePath: getImagePath(this.image),
        creator: this.creator,
        videos: this.videos.map(video => {
            return {
                id: video._id,
                name: video.name,
                path: `${process.env.API_URL}/api/stream/${this._id}/${video._id}`,
                duration: video.duration,
                hasWatched: user.hasWatched(video)
            }
        }),
        tags: this.tags,
        length: this.videos.length,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

module.exports = mongoose.model('Upload', UploadSchema)