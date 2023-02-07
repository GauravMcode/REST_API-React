const jwt = require('jsonwebtoken')
const expect = require('chai').expect;
const sinon = require('sinon');

const authController = require('../controllers/auth');
const User = require('../models/user');

/*  UNIT TESTS*/
describe('is-Auth test', function () {
    it('should throw error if req header does not contain jwt token', function () {
        const req = {
            get: (headerName) => null
        }
        expect(authController.isAuth.bind(this, req, {}, () => { })).to.throw('Not Authenticated')
    })

    it('should throw error if token is not verified', function () {
        const req = {
            get: headerName => 'Bearer abc'
        }
        expect(authController.isAuth.bind(this, req, {}, () => { })).to.throw()
    })


    it('should save userId to req after successfully verifiying token', function () {
        const req = {
            get: headerName => 'Bearer abc'
        }
        // jwt.verify = () => {
        //     return { userId: 'asd3eefeqq3' }
        // }
        sinon.stub(jwt, 'verify')  //stubbing the jwt.verify ; (jwt: object, verify : method) : empties the jwt.verify
        jwt.verify.returns({ userId: 'sdbh3i27iebqd' }) //added functionality to verify method
        authController.isAuth(req, {}, () => { });  //execute isAuth to add userId to req body
        expect(req).to.have.property('userId'); //check is userId was actually added
        expect(req).to.have.property('userId', 'sdbh3i27iebqd'); //check if only that value was added which was provided as userId
        expect(jwt.verify.called).to.be.true; //check if jwt.verify is called or not 
        jwt.verify.restore();
    })
})

describe('Log-in test', function () {

    /* testing log-in by stubbing User.findOne() and using done() for async function*/
    it('should throw an error if accessing database fails', function (done) {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'hello@hello.com',
                password: 'hello'
            }
        }
        authController.login(req, {}, () => { }).then(result => {
            console.log(result.statusCode);
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        })

        User.findOne.restore();
    })
})

describe('getUserStatus Test', function () {
    it('')
})