const { validationResult } = require('express-validator/check');
exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{ title: 'first post', content: 'This is the first post' }]
    })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult();
    if (!errors.isEmpty()) {
        res.status(422).json({
            message: 'Validation Failed. Incorrect input data',
            errors: errors.array()
        })
    }
    const title = req.body.title;
    const content = req.body.content;
    //save to database
    //if success:
    res.status(201).json({
        message: "Post created successfully",
        post: {
            id: new Date().getTime(), title: title, content: content
        }
    })
}