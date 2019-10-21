const mysql         = require('anytv-node-mysql');

/*
  CLASS for database set-up and functionalities
  Specific for MySQL
  Can contain basic queries for the API
*/


class Database{
  contructor(connection){
    this.connection = connection;
  }

}

// Export database configuration and setup

module.exports.setupDatabaseConnection = (configurationSetting)=>{
  return new Promise((success,error)=>{
    // Check if the minimum requirements of MySQL is provided
    if(!configurationSetting.host) throw new Error('MySQL host must be specified');
    if(!configurationSetting.user) throw new Error('MySQL user must be specified');
    if(!configurationSetting.password) throw new Error('MySQL password must be specified');
    if(!configurationSetting.database) throw new Error('MySQL database must be specified');

    success(new Database(mysql.add('master',configurationSetting)));
  });
};
