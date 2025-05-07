export interface Property {
  id: string | number;
  /* basic identity */
  name: string;
  description?: string;

  /* location / status */
  location: string;
  status: string;
  upload_date: string;

  /* financials */
  annual_return_rate: number; // % per year
  expected_roi: number; // final ROI %
  total_needed: number; // funding goal
  current_funded: number; // funded so far
  funding_percentage: number; // 0-100
  current_value: number; // latest appraisal / asking price
  min_investment: number; // absolute DT
  investment_period?: number; // months
  rental_yield?: number; // % per year

  /* property details */
  type: string; // residential | commercial | …
  rooms: number | null;
  bathrooms?: number | null;
  area?: number | null; // m²
  construction_year?: number;
  amenities?: {
    gym?: boolean;
    pool?: boolean;
    parking?: boolean;
    security?: boolean;
    [key: string]: boolean | undefined;
  };

  /* media */
  images: string[];
}
