const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

const error500 = (err, status) => {
    const error = new Error(err);
    error.statusCode = error.statusCode || status;
    return error;
}

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'first post',
            content: 'This is the first post',
            imageUrl: 'images/laptop.jpg',
            creator: {
                name: 'Gaurav'
            },
            createdAt: new Date()
        }]
    })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw error500('Validation Failed. Incorrect input data', 422);
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/laptop.jpg',
        creator: {
            name: 'Gaurav'
        }
    })
    post.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Post created successfully",
                post: result
            })
        })
        .catch(err => next(error500(err, 500)));
}