import axios from "axios";
import API_URL from "@shared/constants/api";
import { Property } from "@shared/types/property";

/**
 * Fetch one project → map it into the front-end shape.
 * @param id numeric or string id
 */
export const getPropertyById = async (
  id: string | number
): Promise<Property> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/projects/${id}`, {
      headers: { "Content-Type": "application/json" },
    });

    const goal = Number(data.goal_amount);
    const cur = Number(data.current_amount);

    return {
      id: data.id.toString(),
      name: data.name,
      description: data.description,
      location: data.location ?? "Unknown",
      status: data.status,
      upload_date: data.created_at.split("T")[0],

      annual_return_rate: Number(data.expected_roi),
      expected_roi: Number(data.expected_roi),
      total_needed: goal,
      current_funded: cur,
      funding_percentage: goal ? Math.round((cur / goal) * 100) : 0,
      current_value: goal,
      min_investment: Number(data.minimum_investment),
      investment_period: data.investment_period,
      rental_yield: Number(data.rental_yield),

      type: data.property_type ?? "unknown",
      rooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: Number(data.property_size),
      construction_year: data.construction_year,
      amenities: data.amenities ?? {},

      images: data.image_url ? [data.image_url] : [],
    };
  } catch (error: any) {
    throw (
      error.response?.data || { message: "Failed to fetch property details" }
    );
  }
};
