export interface WindowMetric {
  id: number;
  icon: string;
  label: string;
  value: string;
}

// Simulated mock data
const MOCK_METRICS: WindowMetric[] = [
  {
    id: 1,
    icon: "dollar-sign",
    label: "Total volume (AED)",
    value: "31.91M",
  },
  {
    id: 2,
    icon: "repeat",
    label: "Total shares transferred",
    value: "34.63M",
  },
  {
    id: 3,
    icon: "users",
    label: "Buyers for every 1 seller (last window)",
    value: "0.84",
  },
  {
    id: 4,
    icon: "clock",
    label: "Total avg. time for a sale",
    value: "1.18h",
  },
];

// Simulated fetch function
export async function fetchWindowPerformance(): Promise<WindowMetric[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_METRICS), 1200);
  });
}
