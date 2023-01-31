const express = require('express')
const { body } = require('express-validator');

const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth')

router.put('/signup',        //wether we create new or update existing user: thatswhy 'put'
    [
        body('email', 'Not a calid email')
            .isEmail()
            .trim()
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            return Promise.reject('Email already exists')
                        }
                        return true;
                    })
                    .catch(err => console.log(err))
            })
            .normalizeEmail(),
        body('password', 'Not a valid password').isLength({ min: 5 }).trim(),
        body('name', 'not a valid name').isLength({ min: 5 }).trim()
    ],
    authController.signup)

router.post('/login')

module.exports = router;