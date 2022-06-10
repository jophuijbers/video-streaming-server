const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const routes = require('./routes')

require('dotenv').config()

const app = express()
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(cors())
app.use('/api', routes)


if (isProduction) {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to database')
    })
} else {
    mongoose.connect('mongodb://localhost/video-streaming')
    .then(() => {
        console.log('Connected to database')
    })
    mongoose.set('debug', true)
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})