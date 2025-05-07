import axios from "axios";
import API_URL from "@shared/constants/api";
import { Property } from "@shared/types/property";

export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/projects`, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data.map((p: any): Property => {
      const goal = Number(p.goal_amount);
      const current = Number(p.current_amount);

      return {
        id: p.id.toString(),
        name: p.name,
        location: p.location ?? "Unknown",
        status: p.status,
        upload_date: p.created_at.split("T")[0],
        annual_return_rate: Number(p.expected_roi),
        expected_roi: Number(p.expected_roi), // ✅ added
        total_needed: goal,
        current_funded: current,
        funding_percentage: goal ? Math.round((current / goal) * 100) : 0,
        min_investment: Number(p.minimum_investment), // ✅ added
        rooms: p.bedrooms,
        type: p.property_type ?? "unknown",
        current_value: goal,
        images: p.image_url ? [p.image_url] : [],
      };
    });
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch project list" };
  }
};
