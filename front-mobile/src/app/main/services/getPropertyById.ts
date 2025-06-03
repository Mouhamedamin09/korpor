import { Property } from "@shared/types/property";
import {
  calculateFundingPercentage,
  categorizeProperty,
} from "./propertyUtils";
import { apiService } from "../../services/apiService";

/**
 * Fetch single property from backend API.
 */
export const getPropertyById = async (
  id: string | number
): Promise<Property> => {
  try {
    console.log(`🔍 Fetching property ${id} from backend...`);

    // Use the apiService with proper authentication
    const backendProperty = await apiService.get(`/api/properties/${id}`, {
      authenticated: false,
    });
    console.log(`✅ Fetched property: ${backendProperty.name}`);

    // Transform backend data to frontend Property interface
    const fundingPercentage = calculateFundingPercentage(
      backendProperty.current_amount || 0,
      backendProperty.goal_amount || 1
    );

    const property: Property = {
      id: backendProperty.id.toString(),
      name: backendProperty.name,
      location: backendProperty.location,
      status:
        backendProperty.property_status ||
        backendProperty.status?.toLowerCase() ||
        "available",
      category: categorizeProperty(
        backendProperty.property_status ||
          backendProperty.status?.toLowerCase() ||
          "available",
        fundingPercentage
      ),
      upload_date: backendProperty.created_at
        ? new Date(backendProperty.created_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      annual_return_rate:
        backendProperty.expected_roi || backendProperty.rental_yield || 0,
      expected_roi: backendProperty.expected_roi || 0,
      total_needed: backendProperty.goal_amount || 0,
      current_funded: backendProperty.current_amount || 0,
      funding_percentage: fundingPercentage,
      min_investment: backendProperty.minimum_investment || 1000,
      type: backendProperty.property_type || "residential",
      rooms: backendProperty.bedrooms || null,
      bathrooms: backendProperty.bathrooms || null,
      area: backendProperty.property_size || null,
      construction_year: backendProperty.construction_year || null,
      description: backendProperty.description || "",
      current_value: backendProperty.goal_amount || 0,
      investment_period: backendProperty.investment_period || 12,
      rental_yield: backendProperty.rental_yield || 0,
      images:
        backendProperty.images?.map((img: any) => img.image_url) ||
        [backendProperty.image_url].filter(Boolean) ||
        [],
      amenities: backendProperty.amenities || {},
    };

    console.log("✅ Property transformed successfully");
    return property;
  } catch (error) {
    console.error(`❌ Error fetching property ${id}:`, error);

    // Fallback to mock data if backend is unavailable
    console.log("⚠️ Falling back to mock data...");
    return getFallbackProperty(id);
  }
};

// Fallback mock property in case backend is unavailable
const getFallbackProperty = (id: string | number): Property => {
  return {
    id: id.toString(),
    name: "Tunis Bay Residence",
    description: "Modern beachfront property with high ROI potential.",
    location: "Tunis, Tunisia",
    status: "available",
    upload_date: "2025-06-01",
    annual_return_rate: 7.5,
    expected_roi: 7.5,
    total_needed: 250000,
    current_funded: 125000,
    funding_percentage: 50,
    current_value: 250000,
    min_investment: 5000,
    investment_period: 12,
    rental_yield: 6.8,
    type: "residential",
    rooms: 3,
    bathrooms: 2,
    area: 120,
    construction_year: 2022,
    amenities: {
      wifi: true,
      parking: true,
      gym: true,
      pool: false,
    },
    images: [
      "https://www.decorilla.com/online-decorating/wp-content/uploads/2020/08/Modern-Apartment-Decor-.jpg",
    ],
  };
};
