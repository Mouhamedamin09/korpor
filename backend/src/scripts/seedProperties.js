const { testConnection } = require("../config/db.config");
const Project = require("../models/Project");
const PropertyImage = require("../models/PropertyImage");
const User = require("../models/User");

// Real property data with Cloudinary images
const realProperties = [
  {
    name: "Luxury Marina Apartments",
    description:
      "Premium waterfront apartments in the heart of Tunis Marina. This exclusive development features modern architecture, panoramic sea views, and world-class amenities. Each unit is designed with high-end finishes, smart home technology, and private balconies overlooking the Mediterranean.",
    location: "Tunis Marina, Tunisia",
    goal_amount: 2500000,
    current_amount: 750000,
    status: "Active",
    property_status: "available",
    property_type: "residential",
    property_size: 145.5,
    bedrooms: 3,
    bathrooms: 2,
    construction_year: 2024,
    expected_roi: 12.5,
    rental_yield: 8.2,
    investment_period: 36,
    minimum_investment: 5000,
    amenities: {
      gym: true,
      pool: true,
      parking: true,
      security: true,
      concierge: true,
      spa: true,
      beachAccess: true,
    },
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    name: "Commercial Plaza Downtown",
    description:
      "Strategic commercial development in Tunis city center. This mixed-use project combines retail spaces, office units, and dining establishments. Located in a high-traffic area with excellent public transportation access and growing business district.",
    location: "Downtown Tunis, Tunisia",
    goal_amount: 3200000,
    current_amount: 1900000,
    status: "Active",
    property_status: "available",
    property_type: "commercial",
    property_size: 850.0,
    construction_year: 2023,
    expected_roi: 15.8,
    rental_yield: 11.4,
    investment_period: 48,
    minimum_investment: 10000,
    amenities: {
      parking: true,
      security: true,
      elevator: true,
      airConditioning: true,
      highSpeedInternet: true,
    },
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    name: "Eco-Friendly Housing Complex",
    description:
      "Sustainable residential complex featuring solar panels, rainwater harvesting, and green building materials. This innovative project promotes environmental responsibility while providing comfortable modern living spaces for families.",
    location: "Sousse, Tunisia",
    goal_amount: 1800000,
    current_amount: 1620000,
    status: "Active",
    property_status: "available",
    property_type: "residential",
    property_size: 120.0,
    bedrooms: 2,
    bathrooms: 2,
    construction_year: 2024,
    expected_roi: 10.2,
    rental_yield: 7.5,
    investment_period: 42,
    minimum_investment: 3000,
    amenities: {
      solarPanels: true,
      garden: true,
      parking: true,
      playground: true,
      communityCenter: true,
      recyclingCenter: true,
    },
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    name: "Seaside Resort Villas",
    description:
      "Exclusive beachfront villa development in Hammamet. These luxury villas offer private pools, direct beach access, and stunning Mediterranean views. Perfect for high-end vacation rentals and premium real estate investment.",
    location: "Hammamet, Tunisia",
    goal_amount: 4500000,
    current_amount: 1350000,
    status: "Active",
    property_status: "available",
    property_type: "residential",
    property_size: 280.0,
    bedrooms: 4,
    bathrooms: 3,
    construction_year: 2024,
    expected_roi: 14.7,
    rental_yield: 9.8,
    investment_period: 60,
    minimum_investment: 15000,
    amenities: {
      privatePool: true,
      beachAccess: true,
      security: true,
      parking: true,
      garden: true,
      barbecueArea: true,
      oceanView: true,
    },
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1520637836862-4d197d17c973?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    name: "Modern Business Center",
    description:
      "State-of-the-art office complex designed for modern businesses. Features flexible office spaces, conference facilities, high-speed internet infrastructure, and premium location in the emerging business district.",
    location: "Sfax, Tunisia",
    goal_amount: 2800000,
    current_amount: 980000,
    status: "Active",
    property_status: "available",
    property_type: "commercial",
    property_size: 950.0,
    construction_year: 2023,
    expected_roi: 13.2,
    rental_yield: 10.1,
    investment_period: 45,
    minimum_investment: 8000,
    amenities: {
      conferenceRooms: true,
      highSpeedInternet: true,
      parking: true,
      security: true,
      elevator: true,
      airConditioning: true,
      cafeteria: true,
    },
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    name: "Student Housing Complex",
    description:
      "Modern student accommodation near University of Tunis. Designed specifically for student needs with study areas, high-speed internet, laundry facilities, and 24/7 security. Excellent investment opportunity in the education sector.",
    location: "University District, Tunis",
    goal_amount: 1600000,
    current_amount: 1440000,
    status: "Active",
    property_status: "available",
    property_type: "residential",
    property_size: 85.0,
    bedrooms: 2,
    bathrooms: 1,
    construction_year: 2024,
    expected_roi: 11.8,
    rental_yield: 8.9,
    investment_period: 36,
    minimum_investment: 2500,
    amenities: {
      studyRooms: true,
      highSpeedInternet: true,
      laundry: true,
      security: true,
      commonArea: true,
      bike_storage: true,
    },
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    name: "Heritage Renovation Project",
    description:
      "Restoration of a historic building in Tunis Medina, converting it into boutique apartments while preserving traditional architecture. This unique project combines cultural heritage with modern amenities.",
    location: "Medina, Tunis",
    goal_amount: 2200000,
    current_amount: 2200000,
    status: "Funded",
    property_status: "sold_out",
    property_type: "residential",
    property_size: 95.0,
    bedrooms: 2,
    bathrooms: 1,
    construction_year: 1890,
    expected_roi: 9.5,
    rental_yield: 6.8,
    investment_period: 48,
    minimum_investment: 4000,
    amenities: {
      historicalSignificance: true,
      traditionalArchitecture: true,
      courtyardGarden: true,
      security: true,
    },
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format",
    ],
  },
  {
    name: "Industrial Warehouse Complex",
    description:
      "Strategic industrial development for logistics and manufacturing. Located near major transportation hubs with excellent connectivity to ports and highways. Ideal for businesses requiring storage and distribution facilities.",
    location: "Industrial Zone, Bizerte",
    goal_amount: 3500000,
    current_amount: 1050000,
    status: "Active",
    property_status: "available",
    property_type: "industrial",
    property_size: 2500.0,
    construction_year: 2023,
    expected_roi: 16.2,
    rental_yield: 12.5,
    investment_period: 60,
    minimum_investment: 20000,
    amenities: {
      loadingDocks: true,
      highCeilings: true,
      heavyPowerSupply: true,
      security: true,
      railAccess: true,
      parking: true,
    },
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1562979314-bee9a54da0c7?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop&auto=format",
    ],
  },
];

// Function to seed properties
async function seedProperties() {
  try {
    console.log("🌱 Starting property seeding...");

    // Test database connection
    await testConnection();
    console.log("✅ Database connected successfully");

    // Get the first user to assign as creator (or create a default admin user)
    let adminUser = await User.findOne({
      where: { email: "admin@korpor.com" },
    });

    if (!adminUser) {
      console.log("Creating admin user for property creation...");
      const Role = require("../models/Role");
      const bcrypt = require("bcryptjs");

      // Get admin role
      const adminRole = await Role.findOne({ where: { name: "admin" } });

      adminUser = await User.create({
        name: "Korpor",
        surname: "Admin",
        email: "admin@korpor.com",
        password: await bcrypt.hash("admin123", 10),
        birthdate: new Date("1990-01-01"),
        isVerified: true,
        approvalStatus: "approved",
        roleId: adminRole?.id || 1,
        investmentTotal: 0,
        accountNo: Math.floor(Math.random() * 900000000) + 100000000,
      });
      console.log("✅ Admin user created");
    }

    // Clear existing properties - handle missing tables gracefully
    console.log("🗑️ Clearing existing properties...");
    try {
      await PropertyImage.destroy({ where: {} });
      console.log("✅ Cleared property images");
    } catch (error) {
      console.log("⚠️ Property images table doesn't exist, skipping...");
    }

    await Project.destroy({ where: {} });
    console.log("✅ Cleared projects");

    // Insert new properties
    console.log("📝 Creating new properties...");
    for (let i = 0; i < realProperties.length; i++) {
      const propertyData = realProperties[i];
      const images = propertyData.images;
      delete propertyData.images; // Remove images from main data

      // Create the property
      const property = await Project.create({
        ...propertyData,
        created_by: adminUser.id,
        image_url: images[0], // Set the first image as main image
      });

      console.log(`✅ Created property: ${property.name}`);

      // Try to create property images if table exists
      try {
        for (let j = 0; j < images.length; j++) {
          await PropertyImage.create({
            project_id: property.id,
            image_url: images[j],
            cloudinary_public_id: `properties/property-${property.id}-${j + 1}`,
            is_main: j === 0,
            order_index: j,
            created_by: adminUser.id,
          });
        }
        console.log(`  📸 Added ${images.length} images for ${property.name}`);
      } catch (error) {
        console.log(
          `  ⚠️ Could not create property images for ${property.name} (table may not exist)`
        );
      }
    }

    console.log("\n🎉 Property seeding completed successfully!");
    console.log(`📊 Created ${realProperties.length} properties with images`);

    // Display summary
    const properties = await Project.findAll({
      attributes: [
        "id",
        "name",
        "status",
        "property_status",
        "goal_amount",
        "current_amount",
      ],
    });

    console.log("\n📋 Properties Summary:");
    properties.forEach((property) => {
      const fundingPercentage = (
        (property.current_amount / property.goal_amount) *
        100
      ).toFixed(1);
      console.log(
        `  • ${property.name} - ${property.status} - ${fundingPercentage}% funded`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding properties:", error);
    throw error;
  }
}

// Function to update property funding percentage (calculated field)
async function updateFundingPercentages() {
  try {
    const properties = await Project.findAll();

    for (const property of properties) {
      const fundingPercentage =
        (property.current_amount / property.goal_amount) * 100;

      // Update property status based on funding
      let newStatus = property.status;
      let newPropertyStatus = property.property_status;

      if (fundingPercentage >= 100) {
        newStatus = "Funded";
        newPropertyStatus = "sold_out";
      }

      await property.update({
        status: newStatus,
        property_status: newPropertyStatus,
      });
    }

    console.log("✅ Updated funding percentages and statuses");
  } catch (error) {
    console.error("❌ Error updating funding percentages:", error);
  }
}

// Run the seeding
if (require.main === module) {
  seedProperties()
    .then(() => updateFundingPercentages())
    .then(() => {
      console.log("🏁 All done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedProperties, updateFundingPercentages };
