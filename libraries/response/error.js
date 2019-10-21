'use strict';

require('./../../assets/error_response');



exports.err_response = (res,message,context,status)=>{
    res.status(status).send({
        message : message,
        context : context
    });
}
