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


    server.route({
        method: 'GET',
        path: '/',
        handler: function(request, reply) {

            reply({ message: 'Welcome to the Society Hack API Gateway.' });
        }
    });


    
    server.route({
        method: 'GET',
        path: convertPaths('/mortgages/{customerId}'),
        config: {
            tags: ['api'],
            description: "Gets most recent mortgage account balance for user",
            validate: {
                params: {
                    customerId: Joi.string()
                }
            },
            handler: function (request, reply) {

                return reply.proxy({
                    passThrough: true,
                    mapUri: function (request, callback) {

                        var extUri = externalUri('api/mortgage/get?id=' + request.params.customerId, 'mortgages');

                        console.log('mapUri hit with', extUri)

                        if (!request.path) {
                            return cb(Boom.notFound());
                        }

                        console.log('processing proxy before redirecting', {
                            url: convertPaths('api/mortgage/get?id={customerId}'),
                            path: 'api/mortgage/get?id={customerId}'
                        });

                        callback(null, 'http://' + extUri);
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

    server.route({
        method: 'GET',
        path: convertPaths('/creditcard/{customerId}'),
        config: {
            tags: ['api'],
            description: "Gets the credit card balance for the custoer id",
            validate: {
                params: {
                    customerId: Joi.string()
                }
            },
            handler: function (request, reply) {

                return reply.proxy({
                    passThrough: true,
                    mapUri: function (request, callback) {

                        var extUri = externalUri('/api/creditcard/get?id=' + request.params.customerId, 'creditcards');

                        console.log('mapUri hit with', extUri)

                        if (!request.path) {
                            return cb(Boom.notFound());
                        }

                        console.log('processing proxy before redirecting', {
                            url: 'api/creditcard/get?id={customerId}',
                            path: 'api/creditcard/get?id={customerId}'
                        });

                        callback(null, 'http://' + extUri);
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

    server.route({
        method: 'GET',
        path: convertPaths('/Customer/{customerId}'),
        config: {
            tags: ['api'],
            description: "Gets the customer information for the customer id",
            validate: {
                params: {
                    customerId: Joi.string()
                }
            },
            handler: function (request, reply) {

                return reply.proxy({
                    passThrough: true,
                    mapUri: function (request, callback) {

                        var extUri = externalUri('/api/customer/get?id=' + request.params.customerId, 'customer');

                        console.log('mapUri hit with', extUri)

                        if (!request.path) {
                            return cb(Boom.notFound());
                        }

                        console.log('processing proxy before redirecting', {
                            url: 'api/customer/get?id={customerId}',
                            path: 'api/customer/get?id={customerId}'
                        });

                        callback(null, 'http://' + extUri);
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