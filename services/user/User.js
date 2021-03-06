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
    console.log(args.where)
    if(args.where != undefined){


      if(args.where.username){
        where+= `
          AND username = '${args.where.username}'
        `;
      }

      // params.id user for searching using WHERE query statement
      if(args.where.id){

          where+= `
                AND id = '${args.where.id}'
          `;

      };


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
    if(args.where.username){

      if(user.length) return {
        valid : false,
        data : user[0]
      };

      return true

    }

    if(args.where.id) {

      if(user.length) return true;

      return false;

    }


  }

  // CREATE USER

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


    async function send_response(err,result,args,last_query){


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


  async updateUser(request,response,args){

    let err;
    let user;
    let validate_user;
    let id = args.where.id;
    let data = util._get
    .form_data(args.body)
    .from(request.body);


    // Validate request body
    if(data instanceof Error){
      return err_response(response,data.message,INC_DATA,500);
    }

    [err,validate_user] = await to(new User().validateUser(request,response,{
      where : {
        id : id
      }
    }));



    if(validate_user===false){

      return err_response(response,NOT_EXISTING,NOT_EXISTING,404);

    }


    data.updated = new Date();


    mysql.use('master')
      .query(`UPDATE users SET ? WHERE id = ?`,
        [data,id],
        send_response
    )
    .end();

    async function send_response(err,result,args,last_query){

      log_query(last_query)


      // Validate if query does have errors
      // return a json containg message and context of the error with a status code of 500
      if(err){
        return err_response(response,err,BAD_REQ,500);
      }


      // Check if query executes succesfully
      if(!result.affectedRows){
        return err_response(response,ERR_UPDATING,NO_RECORD_CREATED,400);
      }

      // Fetch the newly updated user
      [err,user] = await to(new User().fetchUser(request,response,{
        where : {
          id : id
        }
      }));


      // Send a response of JSON if data is created

      return {
        user : user.user
      };

      // return response.status(200).json({
      //   data : user,
      //   message : 'User updated succesfully',
      //   context : 'Data updated succesfully'
      // });
    }


  }

  async deleteUser(request,response,args){

    let err;
    let user;
    let validate_user;
    let id = args.where.id;
    let query = ` UPDATE users SET deleted = now() WHERE id = ${id}`;

    [err,validate_user] = await to(new User().validateUser(request,response,{
      where : {
        id : id
      }
    }));



    if(err){
      return err_response(response,err,BAD_REQ,500);
    }

    [err,user] = await to(mysql.build(query).promise());

    log_query(query);

    if(err){
      return err_response(response,err,BAD_REQ,500);
    }

    // Send a response of JSON if data is deleted

    return response.status(200).json({
      message : 'User deleted succesfully',
      context : 'Data deleted succesfully'
    });


  }


  async loginUser(request,response,args){

    let err;
    let user = {};
    let validate_user;
    let data = util._get
    .form_data(args.body)
    .from(request.body);

    if(data instanceof Error) {

      return err_response(response,data.message,INC_DATA,500);

    }

    [err,validate_user] = await to(new User().validateUser(request,response,{
      where : {
        username : data.username
      }
    }));


    if(validate_user.valid){
      return err_response(response,NOT_EXISTING,NOT_EXISTING,500);
    }

    if(err){
      return err_response(response,err,BAD_REQ,500);
    }
    console.log(data.password)
    console.log(validate_user.data.password)
    bcrypt.compare(data.password,validate_user.data.password,(err,resp)=>{
      console.log(resp)

            if(err){

                return err_response(response,LOG_FAIL,err,500);
            }
            if(!resp){
                return err_response(response,`${INV_USER}/${INV_PASS}`,LOG_FAIL,404);
            }
            if(resp){
                const token = jwt.sign({
                    id          : validate_user.data.id,
                    first_name  : validate_user.data.first_name,
                    last_name   : validate_user.data.last_name,
                    username    : validate_user.data.username,
                    email       : validate_user.data.email,
                    phone_number: validate_user.data.phone_number,
                    role        : validate_user.data.role
                },'secret');

                if(saveToken(token)===false){
                    return err_response(response,NO_TOKEN_CREATED,err,500);
                }
                user.token = `Bearer ${token}`;
                return response.status(200).json({
                    message     : 'Success',
                    data        : user,
                    //token       : `Bearer ${token}`,
                    success     : true
                })
                // .send();
            }

        });

        function saveToken (token){

          let data = {};
          let err;
          let validate_user;

          data.id = uuidv4();
          data.token = token;
          data.created = new Date();


          mysql.use('master')
              .query(
                  `
                      INSERT INTO tokens SET ?
                  `,
                  data,
                  validate_token
              )
              .end();


          function validate_token(err,result,args,last_query){
              if(err){
                  return false
              }

              if(!result.affectedRows){
                  return false
              }

              return true;
          }

        }

  }





}


module.exports = User;
