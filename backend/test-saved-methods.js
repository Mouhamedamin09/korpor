const { rawQuery } = require("./src/config/db.config");

async function testSavedMethods() {
  try {
    console.log("Testing saved payment methods functionality...");

    // Test database connection
    console.log("1. Testing database connection...");
    const [testResult] = await rawQuery("SELECT 1 as test", []);
    console.log("✅ Database connection working:", testResult);

    // Test table exists
    console.log("2. Checking if saved_payment_methods table exists...");
    const [tables] = await rawQuery(
      "SHOW TABLES LIKE 'saved_payment_methods'",
      []
    );
    console.log("Tables found:", tables);

    if (tables.length === 0) {
      console.log("❌ saved_payment_methods table does not exist!");
      return;
    }

    // Test table structure
    console.log("3. Checking table structure...");
    const [structure] = await rawQuery("DESCRIBE saved_payment_methods", []);
    console.log("Table structure:", structure);

    // Test the exact query from the controller
    console.log("4. Testing the controller query...");
    const userId = "test_user_123";

    try {
      const savedMethods = await rawQuery(
        `SELECT spm.*, 
                JSON_OBJECT(
                  'brand', spm.card_brand,
                  'last4', spm.card_last4,
                  'exp_month', spm.card_exp_month,
                  'exp_year', spm.card_exp_year
                ) as card
         FROM saved_payment_methods spm 
         WHERE spm.user_id = ? AND spm.deleted_at IS NULL
         ORDER BY spm.is_default DESC, spm.created_at DESC`,
        [userId]
      );

      console.log("✅ Controller query successful:", savedMethods);
      console.log("Number of results:", savedMethods.length);
    } catch (queryError) {
      console.log("❌ Controller query failed:", queryError.message);
      console.log("Error details:", queryError);
    }

    // Test simpler query
    console.log("5. Testing simple query...");
    const [simpleResult] = await rawQuery(
      "SELECT * FROM saved_payment_methods WHERE user_id = ?",
      [userId]
    );
    console.log("Simple query result:", simpleResult);

    console.log("🎉 Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit();
  }
}

testSavedMethods();
