const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const error500 = (err, status) => {
    const error = new Error(err);
    error.statusCode = error.statusCode || status;
    return error;
}

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw error500('Validation Failed. Incorrect input data', 422);
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const hashPassword = await bcrypt.hash(password, 12)
        const user = new User({
            name: name,
            email: email,
            password: hashPassword,
        })
        const result = await user.save();
        res.status(201).json({ message: 'Created new User', userId: result._id })
    } catch (err) {
        next(error500(err, 500))
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let fetchedUser;
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            throw error500('No user found with the email', 401)  //401: authentication failed
        }
        fetchedUser = user;
        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
            throw error500('wrong password', 401)
        }
        const token = jwt.sign({  //data, secret, expires-in
            email: email,
            userId: fetchedUser._id.toString()
        },
            'somesupersecretstring',
            { expiresIn: '1h' });
        res.status(200).json({ token: token, userId: fetchedUser._id.toString() })
        return;
    } catch (err) {
        next(error500(err, 500));
        return error500(err, 500);
    }
}

exports.isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {      //if req header doesn't contains jwt token
        throw error500('Not Authenticated', 401);
    }
    const token = authHeader.split(' ')[1];  //extracting token from header
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretstring');  //decode and verify token; returns decoded token
    } catch (error) {
        throw error500(error, 500);
    }
    if (!decodedToken) {  // the token didn't matched, thus decodedToken was undefined
        throw error500('Not Authenticated', 401);
    }
    req.userId = decodedToken.userId;  //saving token to request,that can be used by next middlewares
    next();
}