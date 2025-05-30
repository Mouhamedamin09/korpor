const { sequelize } = require("../config/db.config");
const { rawQuery } = require("../config/db.config");

const seedBackers = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Sample backers data
    const backers = [
      {
        name: "Backer 1",
        image_url: "https://imgur.com/a/5LIzDge",
        order: 1
      },
      {
        name: "Backer 2",
        image_url: "https://imgur.com/6fF86Wi",
        order: 2
      },
      {
        name: "Backer 3",
        image_url: "https://imgur.com/qWFY0PB",
        order: 3
      },
      {
        name: "Backer 4",
        image_url: "https://imgur.com/40D8Lim",
        order: 4
      }
    ];

    // Insert backers
    for (const backer of backers) {
      await rawQuery(
        `INSERT INTO backers 
        (name, image_url, \`order\`, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())`,
        [
          backer.name,
          backer.image_url,
          backer.order
        ]
      );
    }

    console.log("Successfully added backers!");

  } catch (error) {
    console.error("Error seeding backers:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the seeding
seedBackers(); 