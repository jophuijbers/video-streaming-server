const mongoose = require("mongoose")
const {getDuration, getVideoPath} = require('../services/video.service')
const {getImagePath} = require('../services/image.service')

const VideoSchema = mongoose.Schema({
	name: String,
    path: String,
    duration: String
})

const UploadSchema = mongoose.Schema({
	name: String,
    image: String,
    videos: [VideoSchema],
    creator: Object,
}, {timestamps: true})

UploadSchema.methods.toJSON = function() {
    return {
        id: this._id,
        name: this.name,
        imagePath: getImagePath(this.image),
        creator: this.creator,
        videos: this.videos.map(video => {
            return {
                id: video._id,
                name: video.name,
                path: `${process.env.API_URL}/api/stream/${this._id}/${video._id}`
            }
        }),
        length: this.videos.length,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

module.exports = mongoose.model('Upload', UploadSchema)