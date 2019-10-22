const mysql         = require('anytv-node-mysql');
const err_response  = require('./../../libraries/response/error').err_response;
const log_query     = require('./../../libraries/logger/log_query').log_query;
                      require('./../../assets/error_response');


class User{
  constructor(first_name,last_name,username,password){
    this.first_name = first_name;
    this.last_name = last_name;
    this.username = username;
    this.password = password;
  }

  // FETCH USER w/ SEARCH feature

  async fetchUser(request,response,args){

    // QUERIES WILL BE MODIFIED DEPENDING ON THE SCHEMA

    let where = `WHERE deleted IS null `;


    // params.search intended for LIKE query statement of MYSQL (search feature)
    if(args.search){
      where+= `
            AND first_name LIKE '%${args.search}%' \
            OR last_name LIKE '%${args.search}%' \
            OR username LIKE '%${args.search}%' \
      `;
    }
    // params.id user for searching using WHERE query statement
    if(args.id){

        where+= `
              AND id = '${args.id}'
        `;

    };


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

    // Check if query result is not null
    if(!user.length) err_response(response,ZERO_RES,ZERO_RES,404);

    // Send response as a json with a status code of 200
    return response.json({
        data : user,
        message : 'Succesfully fetched data',
        context : 'Retrieved data succesfully'
      })
      .status(200);

  }

  async createUser(request,response,args){

  }


}


module.exports = User;
