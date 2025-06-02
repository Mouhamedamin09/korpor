import { Property } from "@shared/types/property";

/**
 * Mock single property for testing purposes.
 */
export const getPropertyById = async (
  id: string | number
): Promise<Property> => {
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
    investment_period: "12 months",
    rental_yield: 6.8,

    type: "residential",
    rooms: 3,
    bathrooms: 2,
    area: 120,
    construction_year: "2022",
    amenities: {
      wifi: true,
      parking: true,
      gym: true,
      pool: false,
    },

    images: [
      "https://www.decorilla.com/online-decorating/wp-content/uploads/2020/08/Modern-Apartment-Decor-.jpg",
      "https://www.decorilla.com/online-decorating/wp-content/uploads/2020/08/Modern-Apartment-Decor-.jpg",
      "https://www.decorilla.com/online-decorating/wp-content/uploads/2020/08/Modern-Apartment-Decor-.jpg",
    ],
  };
};
