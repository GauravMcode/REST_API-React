const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

const error500 = (err, status) => {
    const error = new Error(err);
    error.statusCode = error.statusCode || status;
    return error;
}

exports.getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        res.status(200).json({ status: user.status })
    }
    catch (err) {
        next(error500(err, 500))
    }
}

exports.updateStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw error500(errors.array(), 422);
    }
    const status = req.body.status;
    try {
        const user = await User.findById(req.userId);
        user.status = status;
        const result = await user.save();
        res.status(200).json({
            user: result
        })
    } catch (err) {
        next(error500(err, 500))
    }

}

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page;
    posts_per_page = 2;
    let totalItems;
    const userId = mongoose.Types.ObjectId(req.userId)
    console.log(userId);
    try {
        const count = await Post.find().countDocuments();
        totalItems = count;

        const posts = await Post.find({ creator: userId })
            .skip((currentPage - 1) * posts_per_page)
            .limit(posts_per_page)
            .sort({ createdAt: -1 })//reverse sort
            .populate("creator");
        res.status(200).json({
            posts: posts,
            totalItems: totalItems
        })
    } catch (err) {
        next(error500(err, 500))
    }

}

exports.createPost = async (req, res, next) => {
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

    try {
        await post.save()
        const user = await User.findById(req.userId)
        user.posts.push(post._id);
        const result = await user.save();
        io.getIO().emit('posts', { action: 'create', post: { ...post._doc, creator: { _id: req.userId, name: user.name } } });
        res.status(201).json({
            message: "Post created successfully",
            post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
            creator: { _id: result._id, name: result.name }
        })
    } catch (err) {
        next(error500(err, 500))
    }
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
    try {
        if (!post) {
            throw error500('No Such Post Found', 404);
        }
        res.status(200).json({ post: post })
    } catch (err) {
        next(error500(err, 500))
    }
}

exports.updatePost = async (req, res, next) => {
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
    const post = await Post.findById(postId).populate('creator')
    try {
        if (!post) {
            throw error500('No such post found', 404);
        }
        if (post.creator._id.toString() !== req.userId) {  //check: if the post  is created by  the user
            throw error500('Not Authorized', 403);
        }
        if (imageUrl !== post.imageUrl) {
            console.log('1');
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        const result = await post.save();
        io.getIO().emit('posts', { action: 'update', post: result })
        res.status(200).json({ message: 'post updated succesfully', post: result })
    } catch (err) {
        next(error500(err, 500))
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId)
        if (!post) {
            throw error500('No such post found', 404);
        }
        //check that  post is by user
        if (post.creator.toString() !== req.userId) {
            throw error500('Not Authorized', 403);
        }
        clearImage(post.imageUrl)
        await post.delete();
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();
        io.getIO().emit('posts', { action: 'delete', postId: postId });
        res.status(200).json({ message: 'deleted product successfully' })
    } catch (err) {
        next(error500(err, 500))
    }
}

clearImage = imagePath => {
    const filePath = path.join(__dirname, '..', 'images', imagePath);
    fs.unlink(filePath, err => console.log(err));
}