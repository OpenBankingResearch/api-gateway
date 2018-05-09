'use strict';

const Confidence = require('confidence');
const Dotenv = require('dotenv');

Dotenv.config({
    silent: true
});

const criteria = {
    env: process.env.NODE_ENV
};


const config = {
    $meta: 'This is the api gateway for the society hack',
    projectName: 'gateway',
    port: {
        api: {
            $filter: 'env',
            test: 9090,
            $default: process.env.SVC_PORT || 8082
        }
    },

    hapiMongoModels: {
        mongodb: {
            uri:process.env.MONGODB_URI
        },
        autoIndex: true
    },
 
    urlPrefix: {
        $filter: 'env',
        test: 'mvp-test',
        $default: 'mvp-dev'
    },

    jwtSecret: {
        $filter: 'env',
        production: process.env.JWT_SECRET,
        $default: 'aStrongJwtSecret-#mgtfYK@QuRV8VMM7T>WfN4;^fMVr)y'
    },
    microservices: {
        $filter: 'env',
        test: {
            mortgages: {
                type: process.env.AUTHORIZATION_SVC_TYPE || 'tcp',
                host: process.env.AUTHORIZATION_SVC_HOST || "mvp-microservice-security.f7cf5f3b.svc.dockerapp.io",
                port: process.env.AUTHORIZATION_SVC_PORT || 8083,
                pin: 'role:authorization'
            },
        },
   
        $default: {
            mortgages: {
                type: process.env.MORTGAGES_SVC_TYPE || 'tcp',
                host: process.env.MORTGAGES_SVC_HOST,
                port: process.env.MORTGAGES_SVC_PORT || 8083,
                pin: 'role:mortgage'
            },
            creditcards: {
                type: process.env.CREDITCARDS_SVC_TYPE || 'tcp',
                host: process.env.CREDITCARDS_SVC_HOST,
                port: process.env.CREDITCARDS_SVC_PORT || 3012,
                pin: 'role:creditcards'
            },
            audit: {
                type: process.env.AUDIT_SVC_TYPE || 'tcp',
                host: process.env.AUDIT_SVC_HOST,
                port: process.env.AUDIT_SVC_PORT || 3010,
                pin: 'role:audit'
            }
        }
    }
};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};