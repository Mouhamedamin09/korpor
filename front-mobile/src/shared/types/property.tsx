// types/property.ts
export interface Property {
  id: string;
  name: string;
  location: string;
  rooms?: number;
  bathrooms?: number;
  area?: number;
  status: string;
  upload_date: string;
  current_value?: number;
  annual_return_rate?: number;
  total_needed?: number;
  current_funded?: number;
  funding_percentage?: number;
  min_investment?: number;
  expected_roi?: number;
  description?: string;
  images?: string[];
  type: string;
  annual_fee?: number;
}
