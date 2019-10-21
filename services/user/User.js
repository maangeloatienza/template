const mysql         = require('anytv-node-mysql');
const err_response  = require('./../../libraries/response/error').err_response;
                      require('./../../assets/error_response');

class User{
  constructor(first_name,last_name,username,password){
    this.first_name = first_name;
    this.last_name = last_name;
    this.username = username;
    this.password = password;
  }

  // FETCH USER

  async fetchUser(request,response,params){
    let query = `
      SELECT * FROM users WHERE deleted IS null
    `;

    let user,err;

    [err,user] = await to(mysql.build(query).promise());

    if(err) return err_response(response,BAD_REQ,err,500)

    if(!user.length) err_response(response,ZERO_RES,ZERO_RES,404);

    return response.json({
        data : user,
        message : 'Succesfully fetched data',
        context : 'Retrieved data succesfully'
      })
      .status(200);

  }

  
}


module.exports = User;
