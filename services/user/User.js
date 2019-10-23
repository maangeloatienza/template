const mysql             = require('anytv-node-mysql');
const bcrypt            = require('bcrypt');
const util              = require('./../../helpers/util');
const uuidv4            = require('uuid/v4');
const jwt               = require('jsonwebtoken');
const err_response      = require('./../../libraries/response/error').err_response;
const log_query         = require('./../../libraries/logger/log_query').log_query;
                          require('./../../assets/error_response');


class User{
  constructor(){
  }

  // FETCH USER w/ SEARCH feature

  async fetchUser(request,response,args){

    let where = ``;
    let query = ``;
    let user;
    let count;
    let err;


    // QUERIES WILL BE MODIFIED DEPENDING ON THE SCHEMA
    where = `WHERE deleted IS null `;



    // params.username intended to validate if username already exists

    if(args.username){
      where+= `
        AND username = '${args.username}'
      `;
    }

    // params.search intended for LIKE query statement of MYSQL (search feature)
    if(args.search){
      where+= `
            AND first_name LIKE '%${args.search}%' \
            OR last_name LIKE '%${args.search}%' \
            OR username LIKE '%${args.search}%' \
      `;
    }

    // Check if query has conditional statement
    if(args.where!== undefined){


      // params.id user for searching using WHERE query statement
      if(args.where.id){

          where+= `
                AND id = '${args.where.id}'
          `;

      };

    }

    // Check if query has conditional statement
    if(args.where == undefined){


      [err,count] = await to(new User().countUser(request,response,{
        whereString : where
      }));

      console.log(err)

    }


    // whole query statement concatunated with WHERE query strings
    query = `
      SELECT * FROM users ${where}
    `;


    // LOG for the query statement
    log_query(query);



    // Run query using anytv-node-mysql library
    [err,user] = await to(mysql.build(query).promise());


    // Validate if query does have errors
    // return a json containg message and context of the error with a status code of 500
    if(err) return err_response(response,BAD_REQ,err,500)


    // Send JSON containing query result
    return {
      user : user,
      count : count
    };

  }



  // COUNT RESULTS
  async countUser(request,response,args){

    let query = ``;
    let where = ` WHERE deleted IS null `;
    let user;
    let err;


    // whole query statement concatunated with WHERE query strings

    if(args.whereString != undefined){
      where = args.whereString;
    }

    query = `
      SELECT count(*) as total FROM users ${where}
    `;



    // Run query using anytv-node-mysql library
    [err,user] = await to(mysql.build(query).promise());


    log_query(query);


    // Validate if query does have errors
    // return a json containg message and context of the error with a status code of 500
    if(err) return err_response(response,BAD_REQ,err,500)

    return user[0].total;

  }

  // VALIDATE USER

  async validateUser(request,response,args) {
    // QUERIES WILL BE MODIFIED DEPENDING ON THE SCHEMA

    let where = `WHERE deleted IS null `;

    // params.username intended to validate if username already exists

    if(args.where != undefined){


      if(args.where.username){
        where+= `
          AND username = '${args.where.username}'
        `;
      }


    }


    // whole query statement concatunated with WHERE query strings

    let query = `
      SELECT * FROM users ${where}
    `;


    // LOG for the query statement
    log_query(query);

    let user,err;


    // Run query using anytv-node-mysql library
    [err,user] = await to(mysql.build(query).promise());


    // Validate if query does have errors
    // return a json containg message and context of the error with a status code of 500
    if(err) return err_response(response,BAD_REQ,err,500)


    // Check if query data already exist
    if(user.length) return false;

    return true;

  }

  async createUser(request,response,args){


    let err;
    let validate_user;

    // GET data for request body
    let data = util._get
    .form_data(args.body)
    .from(request.body);


    // Validate request body
    if(data instanceof Error){
      return err_response(response,data.message,INC_DATA,500);
    }

    [err,validate_user] = await to(new User().validateUser(request,response,{
      where : {
        username : data.username
      }
    }));
    if(validate_user===false){

      return err_response(response,EXISTING,EXISTING,400);

    }

    data.id = uuidv4();
    data.created = new Date();
    data.updated = null;
    data.role_id = data.role_id? data.role_id : null;

    // HASH password then proceed to INSERT query statement
    bcrypt.hash(data.password, 10, function(err, hash) {


        if(err) err_response(response,err,BAD_REQ,500);
        data.password = hash;


        mysql.use('master')
        .query(`INSERT INTO users SET ?`,
            data,
            send_response
        )
        .end();


    });


    function send_response(err,result,args,last_query){


      log_query(last_query)


      // Validate if query does have errors
      // return a json containg message and context of the error with a status code of 500
      if(err){
        return err_response(response,err,BAD_REQ,500);
      }


      // Check if query executes succesfully
      if(!result.affectedRows){
        return err_response(response,ERR_CREATING,NO_RECORD_CREATED,400);
      }

      // Send a response of JSON if data is created

      return response.status(200).json({
        data : {
          firstName   : data.first_name,
          lastName    : data.last_name,
          username    : data.username,
          email       : data.email
        },
        message : 'User created succesfully',
        context : 'Data created succesfully'
      });

    }


  }


}


module.exports = User;
