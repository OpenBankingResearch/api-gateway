'use strict';
const Config = require('../config');
const Hoek = require('hoek');

const Wreck = require('wreck');
const Boom = require('boom');
const Joi = require('joi');



// all attributes are optional
const wreckOptions = {
    redirects: 3,
    timeout: 3000, // 1 second, default: unlimited
    maxBytes: 1048576, // 1 MB, default: unlimited
    rejectUnauthorized: true || false,
};


var convertPaths = function (path) {

    return '/' + Config.get('/urlPrefix') + path;

}

var externalUri = function (path, service) {

    console.log('microservice config:' + Config.get('/microservices'))

    var uri = Config.get('/microservices')[service].host +
        ':' +
        Config.get('/microservices')[service].port + path;

    //+ Config.get('/urlPrefix')

    console.log('index.externalUri generated', uri);

    return uri;

}


const internals = {};

internals.templateCache = {};


internals.proxy = function (request, reply, path,microservice) {


    return reply.proxy({
            passThrough: true,
            mapUri: function (request, callback) {


                console.log({path:path,microservice:microservice})

                var extUri = externalUri(path, microservice);

                console.log('mapUri hit with', extUri)

                if (!request.path) {
                    return cb(Boom.notFound());
                }

                console.log('processing proxy before redirecting', {
                    url: path
                });

                callback(null, 'http://' + extUri);
            },
            onResponse: function (err, res, request, reply, settings, ttl) {

                console.log('receiving the response from the upstream.');

                if (err) {
                    console.log.error(err);

                    if (res.statusCode) {
                        return reply(Boom.create(res.statusCode, res.body.toString(), {
                            timestamp: Date.now()
                        })).headers = res.headers;
                    }

                    return reply(Boom.badRequest(err));
                }

                return reply(res).headers = res.headers;

            }
        })


};


exports.register = function (server, options, next) {

    server.expose('proxy', internals.proxy);
   
    next();
};


exports.proxy = internals.proxy;


exports.register.attributes = {
    name: 'proxy'
};