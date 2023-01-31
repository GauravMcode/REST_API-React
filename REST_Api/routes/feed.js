const express = require('express');
const { body } = require('express-validator/check')

const feedController = require('../controllers/feed');
const authController = require('../controllers/auth');

const router = express.Router();

//GET
router.get('/status', authController.isAuth, feedController.getStatus)

router.put('/status', authController.isAuth,
    [
        body('status').trim().not().isEmpty()
    ],
    feedController.updateStatus)

//GET '/feed/posts'
router.get('/posts', authController.isAuth, feedController.getPosts);

//POST '/feed/post'
router.post('/post', authController.isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], feedController.createPost);

router.get('/post/:postId', authController.isAuth, feedController.getPost);

router.put('/post/:postId', authController.isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], feedController.updatePost);

router.delete('/post/:postId', authController.isAuth, feedController.deletePost)

module.exports = router;