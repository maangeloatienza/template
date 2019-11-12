'use strict';

const mysql             = require('anytv-node-mysql');
const uuidv4            = require('uuid/v4');
const jwt               = require('jsonwebtoken');
const User              = require('./../services/user/User');
const err_response      = require('./../libraries/response/error').err_response;
                          require('./../assets/error_response');

const userClass = new User();

const userBody  = {
    first_name    : '',
    last_name     : '',
    username      : '',
    email         : '',
    password      : '',
    phone_number  : '',
    address       : '',
    _role_id      : ''
}

const userOptBody = {
    _first_name    : '',
    _last_name     : '',
    _username      : '',
    _email         : '',
    _password      : '',
    _phone_number  : '',
    _address       : '',
    _role_id      : ''
}

const getUsers = async(req,res,next)=>{


  let {
    search
  } = req.query;


  let users = await userClass.fetchUser(req,res,{
    search : search
  });


  if(!users.user.length){
    return err_response(res,ZERO_RES,ZERO_RES,404);
  }

  return res.status(200).json({
    data : users.user,
    total : users.count,
    message : 'Users succesfully fetched',
    context : 'Data fetched succesfully'
  });

}


const getUserById = async(req,res,next)=>{


  let {
    id
  } = req.params;


  let user = await userClass.fetchUser(req,res,{
    where : {
      id : id
    }
  });


  if(!user.user.length){
    return err_response(res,ZERO_RES,ZERO_RES,404);
  }

  return res.status(200).json({
    data : user.user[0],
    message : 'User succesfully fetched',
    context : 'Data fetched succesfully'
  });


}

const createUser = async(req,res,next)=>{

  userClass.createUser(req,res,{
    body : userBody
  });


}


const updateUser = async(req,res,next)=>{


  let {
    id
  } = req.params;
  let err;
  let users;

  [err,users] = await to(userClass.updateUser(req,res,{
    where : {
      id : id,

    },
    body : userOptBody
  }));



  return res.status(200).json({
    message : 'User updated succesfully',
    context : 'Data updated succesfully'
  });


}



module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser
}
