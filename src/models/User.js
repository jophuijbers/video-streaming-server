const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const UserSchema = mongoose.Schema({
	username: String,
	password: String,
    role: String
}, {timestamps: true})

UserSchema.pre('save', async function(next) {
    this.role !== null ? this.role : 'user'

    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 10)
})

UserSchema.methods.toJSON = function() {
    return {
        id: this._id,
        username: this.username,
        role: this.role,
        isAdmin: this.role === 'admin'
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
    return jwt.sign({
        id: this._id,
        username: this.username
    }, process.env.ACCESS_TOKEN_SECRET)
}

module.exports = mongoose.model('User', UserSchema)