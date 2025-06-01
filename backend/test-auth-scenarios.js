const http = require("http");

const testScenarios = [
  {
    name: "No authentication headers",
    headers: {
      "Content-Type": "application/json",
    },
  },
  {
    name: "With x-user-id test_user_123",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": "test_user_123",
    },
  },
  {
    name: "With empty x-user-id",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": "",
    },
  },
  {
    name: "With different user ID (6)",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": "6",
    },
  },
];

console.log(
  "Testing saved payment methods endpoint with different auth scenarios...\n"
);

async function testScenario(scenario, index) {
  return new Promise((resolve) => {
    console.log(`${index + 1}. ${scenario.name}`);

    const options = {
      hostname: "192.168.1.201",
      port: 5000,
      path: "/api/payment/saved-methods",
      method: "GET",
      headers: scenario.headers,
    };

    const req = http.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.status === "success") {
            console.log(
              `   Response: ${
                response.payment_methods?.length || 0
              } payment methods`
            );
          } else {
            console.log(
              `   Response: ${response.status} - ${response.message}`
            );
            if (response.error) {
              console.log(`   Error: ${response.error}`);
            }
          }
        } catch (e) {
          console.log(`   Raw response: ${data.substring(0, 100)}...`);
        }
        console.log("");
        resolve();
      });
    });

    req.on("error", (err) => {
      console.log(`   Error: ${err.message}\n`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  for (let i = 0; i < testScenarios.length; i++) {
    await testScenario(testScenarios[i], i);
    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("🎉 All tests completed!");
  process.exit();
}

runTests();
