'use strict';

const Confidence = require('confidence');
const Config = require('./config');
const Pack = require('./package');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the gateway config',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true,
                cors: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/api'),
        labels: ['api']
    }],
    registrations: [{
            plugin: 'vision'
        }, {
            plugin: 'inert'
        }, {
            plugin: 'lout'
        }, {
            plugin: 'h2o2'
        }, {
            plugin: 'chairo'
        }, {
            plugin: './server/api/index'
        },
        {
            plugin: './server/proxy'
        },
        {
            plugin: 'bell'
        },
        {
            plugin: 'hapi-auth-cookie'
        },
        {
            plugin: 'hapi-auth-basic'
        },
        {
            plugin: {
                'register': 'hapi-swagger',
                'options': {
                    info: {
                        'title': 'Society Data Caching API Documentation',
                        'version': Pack.version,
                    },
                    securityDefinitions: {
                        jwt: {
                            description: "Application token",
                            type: 'apiKey',
                            name: 'usertoken',
                            in: 'header'
                        }
                    }
                }
            }
        },
        {
            plugin: {
                register: "good",
                options: {
                    ops: { interval: 5000 },
                    reporters: {
                        console: [{
                                module: "good-squeeze",
                                name: "Squeeze",
                                args: [{
                                    log: "*",
                                    response: "*"
                                }]
                            },
                            {
                                module: "good-console"
                            },
                            "stdout"
                        ]

                    }
                }
            }
        }
    ]
};


const store = new Confidence.Store(manifest);


exports.get = function(key) {

    return store.get(key, criteria);
};


exports.meta = function(key) {

    return store.meta(key, criteria);
};