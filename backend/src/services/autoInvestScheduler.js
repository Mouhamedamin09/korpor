const cron = require("node-cron");
const {
  processAutoInvestDeposits,
} = require("../controllers/autoInvestController");

/**
 * AutoInvest Scheduler Service
 * Handles automatic processing of AutoInvest deposits
 */
class AutoInvestScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.schedule = "0 9 * * *"; // Daily at 9:00 AM
  }

  /**
   * Start the AutoInvest scheduler
   */
  start() {
    if (this.isRunning) {
      console.log("⚠️  AutoInvest scheduler is already running");
      return;
    }

    console.log("🚀 Starting AutoInvest scheduler...");
    console.log(`📅 Schedule: Daily at 9:00 AM (${this.schedule})`);

    // Schedule the job to run daily at 9:00 AM
    this.job = cron.schedule(
      this.schedule,
      async () => {
        await this.processAutoInvestments();
      },
      {
        scheduled: true,
        timezone: "Europe/Tunis", // Adjust timezone as needed
      }
    );

    this.isRunning = true;
    console.log("✅ AutoInvest scheduler started successfully");
  }

  /**
   * Stop the AutoInvest scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log("⚠️  AutoInvest scheduler is not running");
      return;
    }

    if (this.job) {
      this.job.stop();
      this.job = null;
    }

    this.isRunning = false;
    console.log("🛑 AutoInvest scheduler stopped");
  }

  /**
   * Process AutoInvest deposits
   */
  async processAutoInvestments() {
    try {
      console.log("🔄 AutoInvest scheduler: Processing daily investments...");
      this.lastRun = new Date();

      const result = await processAutoInvestDeposits();

      if (result.success) {
        console.log(`✅ AutoInvest processing completed:`, {
          processed: result.processed,
          failed: result.failed,
          total: result.total,
          timestamp: this.lastRun.toISOString(),
        });

        // Log summary for monitoring
        if (result.total > 0) {
          console.log(
            `📊 AutoInvest Summary: ${result.processed}/${result.total} successful deposits`
          );

          if (result.failed > 0) {
            console.warn(
              `⚠️  ${result.failed} AutoInvest deposits failed - check logs for details`
            );
          }
        } else {
          console.log("ℹ️  No AutoInvest deposits due today");
        }
      } else {
        console.error("❌ AutoInvest processing failed:", result.error);
      }
    } catch (error) {
      console.error("💥 AutoInvest scheduler error:", error);
    }
  }

  /**
   * Manually trigger processing (for testing)
   */
  async triggerManual() {
    console.log("🔧 Manual trigger: Processing AutoInvest deposits...");
    return await this.processAutoInvestments();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: this.schedule,
      lastRun: this.lastRun,
      nextRun: this.job ? this.job.nextDates(1).toArray()[0] : null,
    };
  }

  /**
   * Update schedule (requires restart)
   */
  updateSchedule(newSchedule) {
    if (cron.validate(newSchedule)) {
      const wasRunning = this.isRunning;

      if (wasRunning) {
        this.stop();
      }

      this.schedule = newSchedule;
      console.log(`📅 AutoInvest schedule updated to: ${newSchedule}`);

      if (wasRunning) {
        this.start();
      }

      return true;
    } else {
      console.error("❌ Invalid cron schedule format:", newSchedule);
      return false;
    }
  }
}

// Create singleton instance
const autoInvestScheduler = new AutoInvestScheduler();

module.exports = autoInvestScheduler;
