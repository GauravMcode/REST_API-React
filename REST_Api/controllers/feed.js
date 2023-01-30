const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

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
        res.status(422).json({
            message: 'Validation Failed. Incorrect input data',
            errors: errors.array()
        })
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
        .catch(err => console.log(err));
}