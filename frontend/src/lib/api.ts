import type { Dossier } from "./types";
import { MOCK_DOSSIER } from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const API_URL = (import.meta.env.VITE_API_URL as string) ?? "";

export async function startScreening(requirements: string): Promise<string> {
  if (USE_MOCK) return "mock";
  const res = await fetch(`${API_URL}/api/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirements }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.run_id as string;
}

export type PollResult =
  | { status: "queued" | "running" }
  | { status: "succeeded"; dossier: Dossier };

export async function pollScreening(runId: string): Promise<PollResult> {
  if (runId === "mock") return { status: "succeeded", dossier: MOCK_DOSSIER };
  const res = await fetch(`${API_URL}/api/screen/${runId}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<PollResult>;
}
