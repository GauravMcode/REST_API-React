const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const app = express();

const MONGODB_URI = 'mongodb+srv://gaurav:fireup@cluster0.cwp7tik.mongodb.net/messages?retryWrites=true&w=majority'

// app.use(bodyParser.urlencoded()); // parses req with content-type: x-ww-form-urlencoded
app.use(bodyParser.json());//parses req with content-type: application/json

//add headers to every response to config if we allow CORS, methods that can access and header requirements
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') // '*' means all domains are allowed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization') //allow only these headers
    next();
})

app.use('/feed', feedRoutes);

mongoose.connect(MONGODB_URI)
    .then(result => app.listen(8080))
    .catch(err => console.log(err))
