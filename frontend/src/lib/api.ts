import type { Dossier } from "./types";
import { MOCK_DOSSIER } from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const API_URL = (import.meta.env.VITE_API_URL as string) ?? "";

export async function screenMarkets(requirements: string): Promise<Dossier> {
  if (USE_MOCK) return Promise.resolve(MOCK_DOSSIER);
  const res = await fetch(`${API_URL}/api/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirements }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
