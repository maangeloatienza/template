'use strict';

require('./../../assets/error_response');



exports.err_response = (res,message,context,status)=>{
    return res.status(status).json({
        message : message,
        context : context
    });
}
