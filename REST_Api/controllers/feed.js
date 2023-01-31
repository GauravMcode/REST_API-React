const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');


const Post = require('../models/post');
const User = require('../models/user');

const error500 = (err, status) => {
    const error = new Error(err);
    error.statusCode = error.statusCode || status;
    return error;
}

exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            res.status(200).json({ status: user.status })
        })
        .catch(err => next(error500(err, 500)))
}

exports.updateStatus = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw error500(errors.array(), 422);
    }
    const status = req.body.status;
    User.findById(req.userId)
        .then(user => {
            user.status = status;
            return user.save();
        })
        .then(result => {
            res.status(200).json({
                user: result
            })
        })
        .catch(err => next(error500(err, 500)))
}

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page;
    posts_per_page = 2;
    let totalItems;
    const userId = mongoose.Types.ObjectId(req.userId)
    console.log(userId);
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find({ creator: userId }).skip((currentPage - 1) * posts_per_page).limit(posts_per_page).populate("creator", "name");
        })
        .then(posts => {
            res.status(200).json({
                posts: posts,
                totalItems: totalItems
            })
        })
        .catch(err => next(error500(err, 500)))

}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw error500(errors.array(), 422);
    }
    const title = req.body.title;
    const content = req.body.content;
    if (!req.file) {
        throw error500('No valid image found', 422);
    }
    const imageUrl = req.file.filename;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    })
    post.save()
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts.push(post._id);
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "Post created successfully",
                post: post,
                creator: { _id: result._id, name: result.name }
            })
        })
        .catch(err => next(error500(err, 500)));
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        console.log(post);
        if (!post) {
            throw error500('No Such Post Found', 404);
        }
        res.status(200).json({ post: post })
    }).catch(err => next(error500(err, 500)))
}

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw error500('Validation Failed. Incorrect input data', 422);
    }
    console.log(req.params.postId);
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.filename;
    }
    if (!imageUrl) {
        throw error500('Attach valid image file', 422);
    }
    Post.findById(postId)
        .then(post => {
            console.log(post);
            if (!post) {
                throw error500('No such post found', 404);
            }
            if (post.creator.toString() !== req.userId) {  //check: if the post  is created by  the user
                throw error500('Not Authorized', 403);
            }
            if (imageUrl !== post.imageUrl) {
                console.log('1');
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            console.log(result);
            res.status(200).json({ message: 'post updated succesfully', post: result })
        })
        .catch(err => next(error500(err, 500)))
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                throw error500('No such post found', 404);
            }
            //check that  post is by user
            if (post.creator.toString() !== req.userId) {
                throw error500('Not Authorized', 403);
            }
            clearImage(post.imageUrl)
            return post.delete();
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => res.status(200).json({ message: 'deleted product successfully' }))
        .catch(err => next(error500(err, 500)))
}

clearImage = imagePath => {
    const filePath = path.join(__dirname, '..', 'images', imagePath);
    fs.unlink(filePath, err => console.log(err));
}