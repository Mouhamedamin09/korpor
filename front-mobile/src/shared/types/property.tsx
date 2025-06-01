// @shared/types/property.ts

import { PropertyCategory } from "@/app/main/services/propertyUtils";

export interface Property {
  /* identity & meta */
  id: number | string;
  name: string;
  location: string;
  status: string;
  category?: PropertyCategory; // optional here, only used in listing
  upload_date: string;

  /* money */
  annual_return_rate: number;
  expected_roi: number;
  total_needed: number;
  current_funded: number;
  funding_percentage: number;
  min_investment: number;
  current_value: number;

  /* additional finance (optional in card, shown in detail page) */
  investment_period?: number;
  rental_yield?: number;

  /* specification */
  type: string;
  rooms: number | null;
  bathrooms: number | null;
  area: number | null; // in m²
  construction_year: number | null;
  description: string;

  /* amenities (optional for future use) */
  amenities?: {
    gym?: boolean;
    pool?: boolean;
    parking?: boolean;
    security?: boolean;
    [key: string]: any;
  };

  /* media */
  images: string[];
}
