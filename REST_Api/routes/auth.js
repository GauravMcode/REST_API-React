const express = require('express')

const router = express.Router();

router.use('signup')   //wether we create new or update existing user: thatswhy 'put'

module.exports = router;