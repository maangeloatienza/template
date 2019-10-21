const app       = require('./app.js');
const http      = require('http');
                  require('./config/config.js');

const server = http.createServer(app);

server.listen(PORT,()=>{
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
