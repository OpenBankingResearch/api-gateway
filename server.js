'use strict';

const Boom = require('boom');
const Composer = require('./index');
const Config = require('./config').get('/');



Composer((err, server) => {

    if (err) {
        throw err;
    }


    server.decorate('reply', 'ok', function(msg, data) {

        return this.response({ success: true, statusCode:200, message: msg, data: data });

    });

  server.decorate('reply', 'notFound', notFound);
  server.decorate('reply', 'badImplementation', badImpl);
  server.decorate('reply', 'unauthorized', unauthorized);
  server.decorate('reply', 'badRequest', badRequest);
  

function notFound (message) {
    var error = Boom.notFound(message, { success: false, message: message, data: null });
    error.output.payload = error.data;

    return this.response(error);  
}

function badImpl (message) {
  return this.response(Boom.badImplementation(message));  
}

function unauthorized (message) {
    var error = Boom.unauthorized(message, { success: false, message: message, data: null });
    error.output.payload = error.data;

    return this.response(error);  
}

function badRequest (message, data){
    var error = Boom.badRequest(message, { success: false, message: message, data: (data || null) });
    error.output.payload = error.data;

    return this.response(error);  
}

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;
 
    server.start((error) => {
        
        console.log('Database connection @' + process.env.MONGODB_URI);

        if (error) {
            throw error;
        }

        console.log('Started the gateway on port ' + server.info.port + ' in Env:' + process.env.NODE_ENV);
        
    });
});
