'use strict';

const mysql             = require('anytv-node-mysql');
const uuidv4            = require('uuid/v4');
const jwt               = require('jsonwebtoken');
const User              = require('./../services/user/User');
const err_response      = require('./../libraries/response/error').err_response;
                          require('./../assets/error_response');


const getUsers = async(req,res,next)=>{

  let userClass = new User();
  let {
    search
  } = req.query;

  userClass.fetchUser(req,res,{
    search : search
  });

}


const getUserById = async(req,res,next)=>{

  let userClass = new User();
  let {
    id
  } = req.params;

  userClass.fetchUser(req,res,{
    id : id
  });

}


module.exports = {
  getUsers,
  getUserById
}
