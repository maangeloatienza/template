'use strict';

const express           = require('express');
const router            = express.Router();

// CONTROLLERS
const userCtrl        = require('./../controllers/userController');



// ROUTES

// USER ROUTES
router.get('/users', userCtrl.getUsers);



module.exports = router;
