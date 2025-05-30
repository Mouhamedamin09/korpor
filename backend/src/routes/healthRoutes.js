const express = require("express");
const router = express.Router();
const { sequelize, testConnection } = require("../config/db.config");

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Get system health status
 *     description: Check the health of the server and database connection
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "UP"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "UP"
 *                     responseTime:
 *                       type: number
 *                       example: 45
 *                 server:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       example: 3600
 *                     memoryUsage:
 *                       type: object
 *       500:
 *         description: System health check failed
 */
router.get("/", async (req, res) => {
  try {
    const startTime = Date.now();

    // Test database connection
    await testConnection();

    const endTime = Date.now();
    const databaseResponseTime = endTime - startTime;

    // Get system metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    // Return health status
    res.status(200).json({
      status: "UP",
      timestamp: new Date().toISOString(),
      database: {
        status: "UP",
        responseTime: databaseResponseTime,
        host: sequelize.config.host || "Using socket connection",
        dialect: sequelize.options.dialect,
        database: sequelize.config.database,
      },
      server: {
        uptime: uptime,
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + " MB",
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
          external: Math.round(memoryUsage.external / 1024 / 1024) + " MB",
        },
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "DOWN",
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: "DOWN",
        error: error.message,
      },
    });
  }
});

module.exports = router;
