require("dotenv").config();
const express = require("express");
// Import new security packages
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const setupSwagger = require("./swaggerConfig"); // Import the Swagger setup file

// Import database config
const { testConnection } = require("./config/db.config");
const { syncModels } = require("./models");

// Import models
const Role = require("./models/Role");
const setupAssociations = require("./models/associations");

// Import AutoInvest scheduler
const autoInvestScheduler = require("./services/autoInvestScheduler");

// Import migration
const {
  addAutoInvestPlanIdColumn,
} = require("./migrations/addAutoInvestPlanIdToTransactions");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roleRoutes = require("./routes/roleRoutes");
const propertyRoutes = require("./routes/propertyRoutes"); // Import property routes
const healthRoutes = require("./routes/healthRoutes"); // Import health routes
const userManagementRoutes = require("./routes/userManagementRoutes"); // Import user management routes
const usersListRoutes = require("./routes/usersListRoutes"); // Import users list routes
const foundersStaticRoutes = require("./routes/foundersStatic");
const numbersRoutes = require("./routes/numbers.routes");
const verificationRoutes = require("./routes/verificationRoutes"); // Import verification routes
const investmentRoutes = require("./routes/investmentRoutes"); // Import investment routes
const preferencesRoutes = require("./routes/preferencesRoutes"); // Import preferences routes
const twoFactorRoutes = require("./routes/twoFactorRoutes"); // Import 2FA routes
const walletRoutes = require("./routes/walletRoutes"); // Import wallet routes

const app = express();

// Basic Middleware
app.use(express.json({ limit: "10kb" })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Security Middleware
// Use Helmet to set security headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV === "development") {
      callback(null, true);
      return;
    }

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://korpor-yfpcp7wt7a-uc.a.run.app",
      "https://your-production-frontend.com",
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 86400, // cache preflight requests for 1 day
};
app.use(cors(corsOptions));

// Rate limiting
// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(globalLimiter);

// Set up Swagger docs
setupSwagger(app);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // This handles user profile and phone/email changes
app.use("/api/roles", roleRoutes);
app.use("/api/admin/user-management", userManagementRoutes);
app.use("/api/users", usersListRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/founders", foundersStaticRoutes);
app.use("/api/numbers", numbersRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/investments", investmentRoutes); // Add investment routes
app.use("/api/referrals", require("./routes/referralRoutes")); // Add referral routes
app.use("/api/preferences", preferencesRoutes); // Add preferences routes
app.use("/api/2fa", twoFactorRoutes); // Add 2FA routes
app.use("/api/wallet", walletRoutes); // Add wallet routes
app.use("/api/autoinvest", require("./routes/autoInvestRoutes")); // Add AutoInvest routes

//blockchain APIs
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/projects", require("./routes/project.routes"));
app.use("/api/investments", require("./routes/investment.routes"));
app.use("/api/rent", require("./routes/rent.routes"));

// Add health check endpoint
app.get("/health", (req, res) => {
  // Always return 200 OK to ensure Cloud Run sees the container as healthy
  // This prevents container restarts which can make troubleshooting harder
  res.status(200).json({
    status: "OK",
    service: "korpor-backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "unknown",
  });
});

// Add simple readiness probe that always succeeds
app.get("/ready", (req, res) => {
  res.status(200).send("Ready");
});

// Cloud Run liveness probe
app.get("/healthz", (req, res) => {
  res.status(200).send("Healthy");
});

// Add AutoInvest scheduler status endpoint
app.get("/scheduler-status", (req, res) => {
  const status = autoInvestScheduler.getStatus();
  res.status(200).json({
    autoInvestScheduler: status,
    timestamp: new Date().toISOString(),
  });
});

// Add database health check endpoint
app.get("/db-health", async (req, res) => {
  try {
    // Import outside of the function to avoid potential scope issues
    const {
      sequelize,
      testConnection,
      connectionDetails,
    } = require("./config/db.config");

    // Test the database connection using the testConnection function
    await testConnection();

    // Query to get all table names based on the database type (MySQL)
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = :dbName AND table_type = 'BASE TABLE'",
      {
        replacements: { dbName: connectionDetails.database },
      }
    );

    // Extract table names from result
    const tableNames = tables.map(
      (table) => table.table_name || table.TABLE_NAME
    );

    // Get row counts for each table
    const tableDetails = await Promise.all(
      tableNames.map(async (tableName) => {
        try {
          const [result] = await sequelize.query(
            `SELECT COUNT(*) as count FROM \`${tableName}\``
          );
          const count = result[0].count;
          return {
            name: tableName,
            rows: count,
          };
        } catch (err) {
          console.error(`Error getting row count for table ${tableName}:`, err);
          return {
            name: tableName,
            rows: "Error: Could not count rows",
            error: err.message,
          };
        }
      })
    );

    // Return success with table information
    res.status(200).json({
      status: "OK",
      database: "Connected",
      timestamp: new Date(),
      message: "Database connection is healthy",
      dbName: connectionDetails.database,
      tables: tableDetails,
      tableCount: tableNames.length,
      connectionType: connectionDetails.usingCloudSQL ? "Cloud SQL" : "Direct",
      host: connectionDetails.usingCloudSQL ? null : process.env.DB_HOST,
    });
  } catch (error) {
    // Return error if the connection test failed
    console.error("Database health check failed:", error);
    const { connectionDetails } = require("./config/db.config");

    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      timestamp: new Date(),
      error: error.message,
      message: "Database connection failed",
      connectionDetails: {
        host: connectionDetails.usingCloudSQL ? null : process.env.DB_HOST,
        port: connectionDetails.usingCloudSQL
          ? null
          : process.env.DB_PORT || "3306",
        database: connectionDetails.database,
        instanceName: connectionDetails.instance || "Not configured",
        usingCloudSQL: connectionDetails.usingCloudSQL,
      },
    });
  }
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Global error handler:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("🚀 Starting server initialization...");
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);

    // Import connection details from db.config
    const { connectionDetails } = require("./config/db.config");

    // Log database connection info
    console.log("📦 Database connection info:");
    if (connectionDetails.usingCloudSQL) {
      console.log(
        `- Using Cloud SQL connection: ${connectionDetails.instance}`
      );
    } else {
      console.log(`- Host: ${process.env.DB_HOST}`);
      console.log(`- Port: ${process.env.DB_PORT || "3306"}`);
    }
    console.log(`- Database: ${connectionDetails.database}`);
    console.log(`- User: ${connectionDetails.user}`);

    console.log(`🔌 Port to bind: ${process.env.PORT || 5000}`);

    // First, start the Express server to ensure we're listening on the port quickly
    // This helps Cloud Run recognize the container is starting
    const PORT = process.env.PORT || 5000;
    console.log(`🔄 Starting server on port ${PORT} and host 0.0.0.0...`);

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server listening on port ${PORT}`);
      console.log(`🔍 Health check endpoint: http://localhost:${PORT}/health`);
      console.log(`🔍 DB Health check: http://localhost:${PORT}/db-health`);
      console.log(
        `📊 Scheduler status: http://localhost:${PORT}/scheduler-status`
      );
    });

    // Add error handler for the server
    server.on("error", (err) => {
      console.error("❌ Server failed to start:", err);
      if (err.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please choose another port or free up this port.`
        );
      }
      process.exit(1);
    });

    // Set up database in background - we don't want to block the server startup
    // This allows the health endpoint to be available immediately
    setupDatabaseAsync();

    // Function to set up database in background
    async function setupDatabaseAsync() {
      try {
        // Test database connection with retry
        let connected = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!connected && attempts < maxAttempts) {
          try {
            attempts++;
            console.log(
              `🔄 Testing database connection (attempt ${attempts}/${maxAttempts})...`
            );

            // Use the testConnection from db.config.js
            const { testConnection } = require("./config/db.config");
            await testConnection();

            connected = true;
            console.log("✅ Database connection successful!");
            console.log(
              process.env.INSTANCE_CONNECTION_NAME
                ? `✅ Connected to Cloud SQL instance: ${process.env.INSTANCE_CONNECTION_NAME}`
                : "✅ Connected to direct database"
            );
          } catch (dbError) {
            console.error(
              `❌ Database connection attempt ${attempts} failed:`,
              dbError.message
            );

            if (attempts < maxAttempts) {
              const retryDelay = 3000 * attempts; // Increasing backoff
              console.log(`⏱️ Retrying in ${retryDelay / 1000} seconds...`);
              await new Promise((resolve) =>
                global.setTimeout(resolve, retryDelay)
              );
            }
          }
        }

        if (!connected) {
          console.error(
            `❌ Failed to connect to database after ${maxAttempts} attempts.`
          );
          console.error("⚠️ Starting in limited functionality mode.");
          return;
        }

        // Run migrations before syncing models
        console.log("🔄 Running database migrations...");
        await addAutoInvestPlanIdColumn();
        console.log("✅ Database migrations completed!");

        // Sync models with database (set force to true to recreate tables - BE CAREFUL!)
        console.log("🔄 Syncing database models...");
        await syncModels(false);
        console.log("✅ Database models synced successfully!");

        // Setup default roles
        console.log("🔄 Setting up default roles...");
        await Role.setupDefaultRoles();
        console.log("✅ Default roles setup complete!");

        // Set up model associations
        setupAssociations();

        // Start AutoInvest scheduler after database is ready
        console.log("🔄 Starting AutoInvest scheduler...");
        autoInvestScheduler.start();
        console.log("✅ AutoInvest scheduler started successfully!");

        console.log(
          "🚀 Full server initialization complete with database connectivity!"
        );
        console.log(
          `📚 Swagger docs available at: http://localhost:${PORT}/api-docs`
        );
      } catch (setupError) {
        console.error("❌ Error during database setup:", setupError);
        console.error(
          "⚠️ Server will continue running with limited functionality!"
        );
      }
    }
  } catch (error) {
    console.error("❌ Critical error during server startup:", error);
    console.error("Stack trace:", error.stack);

    // More detailed error logging, but don't crash the server
    // This allows Cloud Run to still see the container as running
    if (
      error.name === "SequelizeConnectionError" ||
      error.name === "SequelizeConnectionRefusedError"
    ) {
      console.error(
        "❌ Database connection failed. Please check your database credentials and make sure the database server is running."
      );
      console.error(`Database host: ${process.env.DB_HOST || "not set"}`);
      console.error(`Database port: ${process.env.DB_PORT || "not set"}`);
      console.error(`Database name: ${process.env.DB_NAME || "not set"}`);
      console.error(`Database user: ${process.env.DB_USER || "not set"}`);
      console.error(
        `Instance connection: ${
          process.env.INSTANCE_CONNECTION_NAME || "not set"
        }`
      );
    }

    // Start the server even if database setup fails
    // This allows the health endpoint to be available
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.error(
        `⚠️ Server started in EMERGENCY MODE on port ${PORT} - limited functionality`
      );
    });
  }
};

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  autoInvestScheduler.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  autoInvestScheduler.stop();
  process.exit(0);
});

// Start the server
startServer();
