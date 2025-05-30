#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { addMoneyToWallet } = require("./admin-add-money");
const { sequelize } = require("../src/models");

// Function to parse CSV file
function parseCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }

    return data;
  } catch (error) {
    console.error(`❌ Error reading CSV file: ${error.message}`);
    return null;
  }
}

// Function to validate batch data
function validateBatchData(data) {
  const errors = [];

  data.forEach((row, index) => {
    const lineNum = index + 2; // +2 because index starts at 0 and we skip header

    if (!row.userId || isNaN(parseInt(row.userId))) {
      errors.push(`Line ${lineNum}: Invalid or missing userId`);
    }

    if (
      !row.amount ||
      isNaN(parseFloat(row.amount)) ||
      parseFloat(row.amount) <= 0
    ) {
      errors.push(`Line ${lineNum}: Invalid or missing amount`);
    }

    if (
      row.balanceType &&
      !["cash", "rewards"].includes(row.balanceType.toLowerCase())
    ) {
      errors.push(
        `Line ${lineNum}: Invalid balanceType (must be 'cash' or 'rewards')`
      );
    }
  });

  return errors;
}

// Function to process batch money addition
async function processBatch(data, preview = false) {
  console.log(
    `\n${preview ? "🔍 PREVIEW MODE" : "💰 PROCESSING BATCH"} - ${
      data.length
    } operations`
  );
  console.log("=".repeat(80));

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const userId = parseInt(row.userId);
    const amount = parseFloat(row.amount);
    const balanceType = row.balanceType?.toLowerCase() || "cash";
    const description = row.description || `Batch deposit - ${balanceType}`;

    console.log(
      `\n${i + 1}/${
        data.length
      } - User ID: ${userId}, Amount: ${amount}, Type: ${balanceType}`
    );

    if (preview) {
      console.log(`   📋 Would add ${amount} to ${balanceType} balance`);
      console.log(`   📝 Description: ${description}`);
      results.push({ userId, amount, balanceType, status: "preview" });
    } else {
      try {
        const success = await addMoneyToWallet(
          userId,
          amount,
          description,
          balanceType
        );
        if (success) {
          successCount++;
          results.push({ userId, amount, balanceType, status: "success" });
        } else {
          errorCount++;
          results.push({ userId, amount, balanceType, status: "error" });
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
        results.push({
          userId,
          amount,
          balanceType,
          status: "error",
          error: error.message,
        });
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  if (preview) {
    console.log(`📋 PREVIEW COMPLETE: ${data.length} operations reviewed`);
    console.log(`💡 To execute, run the same command with --execute flag`);
  } else {
    console.log(
      `✅ BATCH COMPLETE: ${successCount} successful, ${errorCount} errors`
    );
  }

  return results;
}

// Function to create sample CSV
function createSampleCSV() {
  const sampleContent = `userId,amount,balanceType,description
1,100.00,cash,Welcome bonus
2,50.00,rewards,Referral reward
3,25.00,cash,Promotion credit`;

  const filePath = path.join(__dirname, "sample-batch-money.csv");
  fs.writeFileSync(filePath, sampleContent);
  console.log(`📄 Sample CSV created: ${filePath}`);
  console.log("\nSample content:");
  console.log(sampleContent);
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
🏦 BATCH MONEY MANAGEMENT TOOL
==============================

Usage:
  node batch-add-money.js <csvFile> [--execute]     Process CSV file
  node batch-add-money.js --sample                  Create sample CSV file
  node batch-add-money.js --direct <userId> <amount> [balanceType] [description]

CSV Format:
  userId,amount,balanceType,description
  1,100.00,cash,Welcome bonus
  2,50.00,rewards,Referral reward

Options:
  --execute    Actually process the transactions (default is preview mode)
  --sample     Create a sample CSV file
  --direct     Add money directly via command line

Examples:
  node batch-add-money.js users.csv                 # Preview mode
  node batch-add-money.js users.csv --execute       # Execute transactions
  node batch-add-money.js --direct 1 100 cash       # Add 100 cash to user 1
  node batch-add-money.js --sample                  # Create sample CSV
`);
    return;
  }

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }

  try {
    if (args[0] === "--sample") {
      createSampleCSV();
    } else if (args[0] === "--direct") {
      // Direct command line addition
      const userId = parseInt(args[1]);
      const amount = parseFloat(args[2]);
      const balanceType = args[3] || "cash";
      const description = args[4] || `Direct admin deposit - ${balanceType}`;

      if (isNaN(userId) || isNaN(amount) || amount <= 0) {
        console.log("❌ Invalid userId or amount");
        process.exit(1);
      }

      console.log(
        `💰 Adding ${amount} to user ${userId}'s ${balanceType} balance...`
      );
      const success = await addMoneyToWallet(
        userId,
        amount,
        description,
        balanceType
      );

      if (!success) {
        process.exit(1);
      }
    } else {
      // CSV file processing
      const csvFile = args[0];
      const execute = args.includes("--execute");

      if (!fs.existsSync(csvFile)) {
        console.log(`❌ CSV file not found: ${csvFile}`);
        process.exit(1);
      }

      console.log(`📄 Reading CSV file: ${csvFile}`);
      const data = parseCSV(csvFile);

      if (!data) {
        process.exit(1);
      }

      // Validate data
      const errors = validateBatchData(data);
      if (errors.length > 0) {
        console.log("❌ Validation errors:");
        errors.forEach((error) => console.log(`   ${error}`));
        process.exit(1);
      }

      console.log(`✅ CSV validation passed for ${data.length} rows`);

      // Process batch
      const results = await processBatch(data, !execute);

      // Save results log
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const logFile = path.join(__dirname, `batch-results-${timestamp}.json`);
      fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
      console.log(`📋 Results saved to: ${logFile}`);
    }
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { processBatch, parseCSV, validateBatchData };
