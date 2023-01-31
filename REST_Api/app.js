const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const MONGODB_URI = 'mongodb+srv://gaurav:fireup@cluster0.cwp7tik.mongodb.net/messages?retryWrites=true&w=majority'

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}


// app.use(bodyParser.urlencoded()); // parses req with content-type: x-ww-form-urlencoded
app.use(bodyParser.json());//parses req with content-type: application/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'images')))


//add headers to every response to config if we allow CORS, methods that can access and header requirements
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') // '*' means all domains are allowed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization') //allow only these headers
    next();
})

app.use('/feed', feedRoutes);
app.use('/feed', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message })
})

mongoose.connect(MONGODB_URI)
    .then(result => app.listen(8080))
    .catch(err => console.log(err))
