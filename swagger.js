const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info : {
        title : 'API Documentation',
        description : 'documentation of the api',
        version : '1.0.0'
    },
    host : 'localhost:5004'
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

swaggerAutogen(outputFile, routes, doc);