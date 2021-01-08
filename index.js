const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const UserRouter = require('./routes/users')

const hostname = "localhost"
const port = 3000
const url = "mongodb://127.0.0.1/B2BDB";

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;

connection.once('open', ()=>{
    console.log("Successfully connected to database");
});

app.use('/api/users', UserRouter)

app.listen(port, hostname, () =>{
    console.log(`Server up and running on https://${hostname}:${port}`);
})