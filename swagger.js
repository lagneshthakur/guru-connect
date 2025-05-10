const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/app.js']; // path to your routes files
const options = {
    info: {
      title: 'Guru Connect API',
      version: '1.0.0',
      description: 'API docs for Guru Connect backend system',
    },
    host: 'localhost:3000',
    schemes: ['http', 'https'],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization routes',
      },
      {
        name: 'Groups',
        description: 'Group management routes',
      },
      {
        name: 'Messages',
        description: 'Message management routes',
      },
    ],
    basePath: '/',
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT authorization header',
      },
    },
    components: {
      schemas: {
        User: {
          email: 'john@example.com',
          password: 'password123',
        },
      },
    },
};
const swaggerSpec = swaggerAutogen(outputFile, endpointsFiles, options);
module.exports = swaggerSpec;