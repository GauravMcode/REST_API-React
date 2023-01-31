const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw error500('Validation Failed. Incorrect input data', 422);
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hashPassword,
            })
            return user.save();
        })
        .then(result => res.status(201).json({ message: 'Created new User', userId: result._id }))
        .catch(err => next(err, 500))
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                throw error500('No user found with the email', 401)  //401: authentication failed
            }
            bcrypt.compare(password, user.password)
                .then(isEqual => {
                    if (!isEqual) {
                        throw error500('wrong password', 401)
                    }
                })
                .catch(err => next(error500(err, 500)))
        })
        .catch(err => next(err, 500))
}