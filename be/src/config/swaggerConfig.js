const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = ['../routes/*.js'];

const swaggerDocument = {
  info: {
    version: "1.0.0",
    title: "CarRental",
    description: "API for CarRental",
    contact: {
      name: "API Support",
      email: "maqib82001@gmail.com",
    },
  },
  host: "https://dev-carrental.onrender.com/api",
  basePath: "/",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [],
  securityDefinitions: {},
  definitions: {
    apiResponse: {
      code: 200,
      message: "Success",
    },
    "errorResponse.400": {
      code: 400,
      message:
      "The request was malformed or invalid. Please check the request parameters.",
    },
    "errorResponse.401": {
      code: 401,
      message: "Authentication failed or user lacks proper authorization.",
    },
    "errorResponse.403": {
      code: 403,
      message: "You do not have permission to access this resource.",
    },
    "errorResponse.404": {
      code: "404",
      message: "The requested resource could not be found on the server.",
    },
    "errorResponse.500": {
      code: 500,
      message:
      "An unexpected error occurred on the server. Please try again later.",
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, swaggerDocument);