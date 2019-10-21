
const Database        = require('./database/db_config');

const express         = require('express');
const bodyParser      = require('body-parser');
const routeManagement = require('./routes/index');
const app             = express();


// Import neccessary data from .env variables
require('./config/config');
// Import global functions
require('./global_functions');

console.log(MYSQL_DATABASE)
// Use Database CLASS method to setup database connection
Database.setupDatabaseConnection({
  host : MYSQL_HOST,
  user : MYSQL_USER,
  password : MYSQL_PASSWORD,
  database : MYSQL_DATABASE
});

// Setup bodyParser to accept json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: "50mb", extended: false, parameterLimit:50000,type:'*/x-www-form-urlencoded'}));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization');
  next();
});


app.use('/v1',routeManagement);

app.use('/', (req,res)=>{
  return res.json({
    message : 'Route not found',
    context : 'Route does not exists'
  }).status(404);
});



module.exports = app;
