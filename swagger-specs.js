const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Device account API",
      version: "1.0.0",
      description: "API for device account management",
    },
  },
  apis: [__dirname + "/app.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
