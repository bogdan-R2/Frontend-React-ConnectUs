const express = require('express');
const router = express.Router();
const usersRoute = require('./users.js');
const authRoute = require('./auth.js');
const profileRoute = require('./profile.js');
const miscellaneousRoute = require('./miscellaneous.js')
const chatRoute = require('./chat.js');

router.use('/', authRoute)
router.use('/users', usersRoute);
router.use('/profile', profileRoute);
router.use('/search', miscellaneousRoute);
router.use('/chat', chatRoute);


module.exports = router;