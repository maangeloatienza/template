'use strict';

const express           = require('express');
const router            = express.Router();

// CONTROLLERS
const userCtrl        = require('./../controllers/userController');



// ROUTES

// USER ROUTES
router.get ('/users',           userCtrl.getUsers);
router.get ('/users/:id',       userCtrl.getUserById);
router.post('/users',           userCtrl.createUser);
router.put ('/users/:id',       userCtrl.updateUser);
router.post('/users/login',     userCtrl.loginUser);


module.exports = router;
