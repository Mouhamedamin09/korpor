const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Korpor API Documentation",
      version: "1.0.0",
      description:
        "Complete API documentation for the Korpor platform, providing real estate investment management, user authentication, property management, and more.",
      contact: {
        name: "API Support",
        email: "support@korpor.com",
        url: "https://korpor.com/support",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "https://korpor-yfpcp7wt7a-uc.a.run.app",
        description: "Production API server (Google Cloud Run)",
      },
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT Bearer token (without the 'Bearer ' prefix)",
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description:
          "User authentication operations including registration, login, and token management",
      },
      {
        name: "Users",
        description: "User profile and account management",
      },
      {
        name: "Admin",
        description: "Administrative operations for user management",
      },
      {
        name: "Roles",
        description: "Role-based access control operations",
      },
      {
        name: "Properties",
        description: "Property and real estate listings management",
      },
      {
        name: "Projects",
        description: "Investment project operations",
      },
      {
        name: "Investments",
        description:
          "Real estate investment opportunities and user investment management",
      },
      {
        name: "Payments",
        description: "Payment processing and transaction management",
      },
      {
        name: "Backers",
        description: "Backer management operations",
      },
      {
        name: "Health",
        description: "API health check endpoints",
      },
    ],
    externalDocs: {
      description: "Find out more about Korpor",
      url: "https://korpor.com/docs",
    },
  },
  apis: ["./src/routes/*.js", "./src/routes/*.routes.js", "./src/models/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Korpor API Documentation",
  customfavIcon: "/favicon.ico",
  displayRequestDuration: true,
};

module.exports = (app) => {
  // Serve Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions)
  );

  // Serve Swagger JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("Swagger documentation initialized");
};
