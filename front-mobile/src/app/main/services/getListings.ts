import { Property } from "@shared/types/property";
import {
  calculateFundingPercentage,
  categorizeProperty,
} from "./propertyUtils";
import { apiService } from "../../services/apiService";
import API_URL from "@shared/constants/api";

export const getAllProperties = async (): Promise<Property[]> => {
  try {
    console.log("🔍 Fetching properties from backend...");
    console.log("🔗 Using API URL:", API_URL);

    // Use the apiService with proper authentication
    const response = await apiService.get("/api/properties", {
      authenticated: false,
    });
    console.log(`✅ API Response received:`, response);

    // Extract properties from the nested response structure
    const backendProperties =
      response.data?.properties ||
      response.properties ||
      response.data ||
      response;

    if (!Array.isArray(backendProperties)) {
      console.warn(
        "⚠️ API response is not an array, falling back to mock data"
      );
      return getFallbackProperties();
    }

    console.log(
      `✅ Fetched ${backendProperties.length} properties from backend`
    );

    if (backendProperties.length === 0) {
      console.log(
        "ℹ️ No properties returned from backend, using fallback data"
      );
      return getFallbackProperties();
    }

    // Transform backend data to frontend Property interface
    const properties: Property[] = backendProperties.map((property: any) => {
      const fundingPercentage = calculateFundingPercentage(
        property.goal_amount || 1,
        property.current_amount || 0
      );

      return {
        id: property.id.toString(),
        name: property.name || "Unnamed Property",
        location: property.location || "Unknown Location",
        status:
          property.property_status ||
          property.status?.toLowerCase() ||
          "active",
        category: categorizeProperty(
          property.property_status ||
            property.status?.toLowerCase() ||
            "active",
          fundingPercentage
        ),
        upload_date: property.created_at
          ? new Date(property.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        annual_return_rate: property.expected_roi || property.rental_yield || 0,
        expected_roi: property.expected_roi || 0,
        total_needed: property.goal_amount || 0,
        current_funded: property.current_amount || 0,
        funding_percentage: fundingPercentage,
        min_investment: property.minimum_investment || 1000,
        type: property.property_type || "apartment",
        rooms: property.bedrooms || null,
        bathrooms: property.bathrooms || null,
        area: property.property_size || null,
        construction_year: property.construction_year || null,
        description: property.description || "",
        current_value: property.goal_amount || 0,
        images:
          property.images?.map((img: any) => img.image_url) ||
          [property.image_url].filter(Boolean) ||
          [],
      };
    });

    console.log("✅ Properties transformed successfully");
    return properties;
  } catch (error) {
    console.error("❌ Error fetching properties:", error);

    // Fallback to mock data if backend is unavailable
    console.log("⚠️ Falling back to mock data...");
    return getFallbackProperties();
  }
};

// Fallback mock data in case backend is unavailable
const getFallbackProperties = (): Property[] => {
  console.log("📝 Loading mock properties data...");

  const mockData: Property[] = [
    {
      id: "1",
      name: "Palm Gardens",
      location: "Tunis",
      status: "active",
      category: categorizeProperty("active", 55),
      upload_date: "2024-12-10",
      annual_return_rate: 7.2,
      expected_roi: 7.2,
      total_needed: 100000,
      current_funded: 55000,
      funding_percentage: 55,
      min_investment: 1000,
      type: "apartment",
      rooms: 3,
      bathrooms: 2,
      area: 120,
      construction_year: 2022,
      description:
        "A modern apartment complex near the coast with excellent amenities.",
      current_value: 100000,
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: "2",
      name: "Urban Heights",
      location: "Sousse",
      status: "funded",
      category: categorizeProperty("funded", 100),
      upload_date: "2024-11-05",
      annual_return_rate: 6.5,
      expected_roi: 6.5,
      total_needed: 200000,
      current_funded: 200000,
      funding_percentage: 100,
      min_investment: 500,
      type: "villa",
      rooms: 4,
      bathrooms: 3,
      area: 250,
      construction_year: 2020,
      description: "Luxury villas with city skyline view and premium finishes.",
      current_value: 200000,
      images: [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: "3",
      name: "Coastal Residence",
      location: "Hammamet",
      status: "active",
      category: categorizeProperty("active", 75),
      upload_date: "2024-12-01",
      annual_return_rate: 8.5,
      expected_roi: 8.5,
      total_needed: 150000,
      current_funded: 112500,
      funding_percentage: 75,
      min_investment: 750,
      type: "apartment",
      rooms: 2,
      bathrooms: 2,
      area: 95,
      construction_year: 2023,
      description: "Beachfront apartments with stunning sea views.",
      current_value: 150000,
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      ],
    },
    {
      id: "4",
      name: "Business Plaza",
      location: "Monastir",
      status: "under_review",
      category: categorizeProperty("under_review", 0),
      upload_date: "2024-12-15",
      annual_return_rate: 9.2,
      expected_roi: 9.2,
      total_needed: 300000,
      current_funded: 0,
      funding_percentage: 0,
      min_investment: 2000,
      type: "commercial",
      rooms: null,
      bathrooms: null,
      area: 500,
      construction_year: 2024,
      description:
        "Modern commercial space in the heart of the business district.",
      current_value: 300000,
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      ],
    },
  ];

  console.log(`📝 Loaded ${mockData.length} mock properties`);
  return mockData;
};
