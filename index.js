const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('./logging/morgan')
const logger = require('./logging/logger')
require('dotenv').config()
const UserRouter = require('./routes/users')

const hostname = 'localhost'
const port = process.env.PORT || 3000
const url = process.env.DATABASE_URL

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(morgan)

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connected to Database')
}).catch((err) => {
  logger.error(err.toString())
})

app.use('/api/users', UserRouter)

app.listen(port, hostname, () => {
  logger.info(`Server up and running on https://${hostname}:${port}`)
})
