const { expect } = require('chai');
const mongoose = require('mongoose');

const feedController = require('../controllers/feed');
const User = require('../models/user');

describe('Feed Controller Tests:', function () {
    before(function (done) {  //before: it will  be executed before all test
        mongoose.set("strictQuery", false);
        mongoose.connect('mongodb+srv://gaurav:fireup@cluster0.cwp7tik.mongodb.net/messages-test?retryWrites=true&w=majority')
            .then(connection => {
                const user = new User({
                    name: 'Tester',
                    email: 'test@test.com',
                    password: 'testify',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                })
                return user.save();
            })
            .then(() => {
                done();
            })
    })

    // beforeEach() //execute before each test
    // afterEach() //execute after each test

    describe('getStatus Test', function () {

        it('should send a valid response with status and code for an existing user', function (done) {
            const req = {
                userId: '5c0f66b979af55031b34728a'
            }
            const res = {
                statusCode: 500,
                userStatus: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.userStatus = data.status;
                }
            }
            feedController.getStatus(req, res, () => { }).then((result) => {
                expect(res.statusCode).to.be.equal(200);  //checks status  code
                expect(res.userStatus).to.be.equal; ('I am new!'); // checks status
                done();
            })
        })
    })

    after(function (done) { //after: It will be  executed after all tests
        User.deleteMany({}).then(() => { // deletes dummy data
            return mongoose.disconnect() //disconnects mongoose, so that test can be exited
        })
            .then(() => {
                done();    //to tell that this is a promise chain
            })
    })

})