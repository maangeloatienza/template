'use strict';

const mysql             = require('anytv-node-mysql');
const uuidv4            = require('uuid/v4');
const jwt               = require('jsonwebtoken');
const User              = require('./../services/user/User');
const err_response      = require('./../libraries/response/error').err_response;
                          require('./../assets/error_response');


const getUsers = async(req,res,next)=>{
  res.setHeader('Content-Type', 'application/json');
  
  let userClass = new User();

  userClass.fetchUser(req,res);

}



module.exports = {
  getUsers
}
