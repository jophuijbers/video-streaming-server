const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const moment = require('moment')

const UserSchema = mongoose.Schema({
	username: String,
	password: String,
    role: String,
    lastLogin: Date,
    watched: [{type: mongoose.Schema.Types.ObjectId, ref: 'Video'}]
}, {timestamps: true})

UserSchema.pre('save', async function(next) {
    this.role = this.role || 'user'

    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.toJSON = function() {
    return {
        id: this._id,
        username: this.username,
        role: this.role,
        isAdmin: this.role === 'admin',
        lastLogin: this.getLastLogin()
    }
}

UserSchema.methods.toAuthJSON = function() {
    return {
        user: {
            id: this._id,
            username: this.username,
            isAdmin: this.role === 'admin'
        },
        token: this.generateJWT()
    }
}

UserSchema.methods.toJSONCreator = function() {
    return {
        id: this._id,
        username: this.username
    }
}

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateJWT = function() {
    this.setLastLogin()
    return jwt.sign({
        id: this._id,
        username: this.username
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '7d'
    })
}

UserSchema.methods.setLastLogin = function() {
    this.lastLogin = Date.now()
    this.save()
}

UserSchema.methods.getLastLogin = function() {
    if (!this.lastLogin) return
    return moment(this.lastLogin).locale('nl').format('L')
}

UserSchema.methods.addToWatched = function(video) {
    if (this.watched.includes(video.id)) return
    this.watched.push(video.id)
    this.save()
}

UserSchema.methods.hasWatched = function(video) {
    return this.watched.includes(video.id)
}

module.exports = mongoose.model('User', UserSchema)