import axios from "axios";
import API_URL from "@shared/constants/api";
import { Property } from "@shared/types/property";
import {
  calculateFundingPercentage,
  categorizeProperty,
} from "./propertyUtils";

export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/projects`, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data.map((p: any): Property => {
      const goal = Number(p.goal_amount);
      const current = Number(p.current_amount);
      const percent = calculateFundingPercentage(goal, current);

      return {
        /* ────────────── basics ────────────── */
        id: p.id.toString(),
        name: p.name,
        location: p.location ?? "Unknown",
        status: p.status,
        category: categorizeProperty(p.status, percent),
        upload_date: p.created_at.split("T")[0],

        /* ────────────── money ────────────── */
        annual_return_rate: Number(p.expected_roi),
        expected_roi: Number(p.expected_roi),
        total_needed: goal,
        current_funded: current,
        funding_percentage: percent,
        min_investment: Number(p.minimum_investment),

        /* ────────────── specs ────────────── */
        type: p.property_type ?? "unknown",
        rooms: p.bedrooms ?? null,
        bathrooms: p.bathrooms ?? null,
        area: p.property_size ? Number(p.property_size) : null,
        construction_year: p.construction_year ?? null,
        description: p.description ?? "",

        /* misc */
        current_value: goal,
        images: p.image_url ? [p.image_url] : [],
      };
    });
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch project list" };
  }
};
