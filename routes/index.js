'use strict';

const express           = require('express');
const router            = express.Router();

// CONTROLLERS
const userCtrl        = require('./../controllers/userController');



// ROUTES

// USER ROUTES
router.get('/users', userCtrl.getUsers);
router.get('/users/:id', userCtrl.getUserById);
router.post('/users', userCtrl.createUser);


module.exports = router;
