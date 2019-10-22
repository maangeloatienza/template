'use strict';

const mysql             = require('anytv-node-mysql');
const uuidv4            = require('uuid/v4');
const jwt               = require('jsonwebtoken');
const User              = require('./../services/user/User');
const err_response      = require('./../libraries/response/error').err_response;
                          require('./../assets/error_response');

const userClass = new User();

const user  = {
    first_name    : '',
    last_name     : '',
    username      : '',
    email         : '',
    password      : '',
    phone_number  : '',
    address       : '',
    _role_id      : ''
}

const getUsers = async(req,res,next)=>{


  let {
    search
  } = req.query;


  userClass.fetchUser(req,res,{
    search : search
  });

}


const getUserById = async(req,res,next)=>{


  let {
    id
  } = req.params;


  userClass.fetchUser(req,res,{
    id : id
  });

}

const createUser = async(req,res,next)=>{


  userClass.createUser(req,res,{
    body : user
  });


}


module.exports = {
  getUsers,
  getUserById,
  createUser
}
