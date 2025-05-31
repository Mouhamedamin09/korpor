const { rawQuery } = require("./src/config/db.config");

async function addTestData() {
  try {
    console.log("Adding test payment methods for user ID 6...");

    // Add a test saved payment method for user ID 6
    const result = await rawQuery(
      `INSERT INTO saved_payment_methods 
       (user_id, type, stripe_payment_method_id, stripe_customer_id, 
        card_brand, card_last4, card_exp_month, card_exp_year, 
        is_default, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        "6", // User ID from profile
        "stripe",
        "pm_test_card_for_user_6",
        "cus_test_customer_6",
        "visa",
        "4242",
        12,
        2027,
        1, // is_default
      ]
    );

    console.log("✅ Added payment method with ID:", result.insertId);

    // Check if it was added correctly
    const [savedMethods] = await rawQuery(
      `SELECT * FROM saved_payment_methods WHERE user_id = ?`,
      ["6"]
    );

    console.log(
      `✅ User 6 now has ${savedMethods.length} saved payment methods`
    );
    console.log("Payment methods:", savedMethods);

    console.log("🎉 Test data added successfully!");
  } catch (error) {
    console.error("❌ Error adding test data:", error);
  } finally {
    process.exit();
  }
}

addTestData();
