// Central utilities for anything “smart” about a property

export type PropertyCategory = "Available" | "Funded" | "Exited";

/* ---------- generic helpers ---------- */
export function calculateFundingPercentage(
  goal: number,
  current: number
): number {
  return goal ? Math.round((current / goal) * 100) : 0;
}

export function categorizeProperty(
  status: string,
  fundedPercentage: number
): PropertyCategory {
  const lc = status?.toLowerCase();
  if (lc === "exited") return "Exited";
  if (fundedPercentage >= 100) return "Funded";
  return "Available";
}

export function filterByCategory<T extends { category: PropertyCategory }>(
  list: T[],
  category: PropertyCategory
): T[] {
  return list.filter((p) => p.category === category);
}

export function shouldShowRooms(propertyType?: string | null): boolean {
  const residential = ["residential", "house", "apartment", "villa", "flat"];
  return !!propertyType && residential.includes(propertyType.toLowerCase());
}
