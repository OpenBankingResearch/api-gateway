'use strict';

exports.register = function(server, options, next) {

    const Wreck = require('wreck');
    const Boom = require('boom');
    const Joi = require('joi');

    var Config = require('../../config');


    // all attributes are optional
    const wreckOptions = {
        redirects: 3,
        timeout: 3000, // 1 second, default: unlimited
        maxBytes: 1048576, // 1 MB, default: unlimited
        rejectUnauthorized: true || false,
    };


    var convertPaths = function(path) {

        return '/' + Config.get('/urlPrefix') + path;

    }

    var externalUri = function(path, service) {

        console.log('external Uri for microservice:' + service)

        console.log('microservice config:' + Config.get('/microservices'))

        var uri = Config.get('/microservices')[service].host +
            ':' +
            Config.get('/microservices')[service].port + path;

        //+ Config.get('/urlPrefix')

        console.log('index.externalUri generated', uri);

        return uri;

    }

    const proxyMap = {
        '/user': externalUri('/users', 'authorization')
    };



    server.route({
        method: 'GET',
        path: '/',
        handler: function(request, reply) {

            reply({ message: 'Welcome to the Society Hack API Gateway.' });
        }
    });

    const proxyHandler = {
        proxy: {
            mapUri: (req, cb) => {
                console.log('proxyHandler.mapUri uri value', req);

                try {

                    const uri = proxyMap[req.path];

                    if (!uri) {
                        return cb(Boom.notFound());
                    }

                    cb(null, uri, req.headers);

                } catch (err) {
                    console.log(err);
                }


            },
            onResponse: (err, res, req, reply, settings, ttl) => {

                if (err) {
                    return reply(err);
                }
                reply(res);
            }
        }
    };

    server.route({
        method: 'GET',
        path: convertPaths('/mortgages/{date}'),
        config: {
            tags: ['api'],
            description: "Gets mortgage account balance  for user",
            validate: {
                params: {
                    year: Joi.number().required()
                }
            },
            handler: function (request, reply) {

                return reply.proxy({
                    passThrough: true,
                    mapUri: function (request, callback) {
                        
                        const proxyHeaders = {
                            'userId': server.app.decodedToken.userId
                        };

                        var extUri = externalUri('/mvp/mortgages/' + request.params.year, 'mortgages');

                        console.log('mapUri hit with', extUri)

                        if (!request.path) {
                            return cb(Boom.notFound());
                        }

                        console.log('processing proxy before redirecting', {
                            url: convertPaths('/mvp-dev/mortgages/{date}'),
                            path: '/mvp/mortgages/{date}'
                        });

                        callback(null, 'http://' + extUri, proxyHeaders);
                    },
                    onResponse: function (err, res, request, reply, settings, ttl) {

                        console.log('receiving the response from the upstream.');

                        if (err) {
                            console.log('response:' + err)
                            
                            return reply(err);
                        }

                        return reply(res).headers = res.headers;

                    }
                })

            }
        }
    })

    function replyWithJSON(err, res, request, reply, settings, ttl) {
        Wreck.read(res, { json: true }, function(err, payload) {
            reply(payload);
        });
    }


    next();
};

exports.register.attributes = {
    name: 'api'
};