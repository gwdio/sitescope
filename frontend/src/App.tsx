import React, { useState, useEffect, useRef } from "react";
import { startScreening, pollScreening } from "./lib/api";
import type { Dossier } from "./lib/types";
import InputView from "./components/InputView";
import LoadingView from "./components/LoadingView";
import DossierView from "./components/DossierView";

const DEMO_TEXT =
  "50MW hyperscale facility. US Sun Belt or Midwest. Grid-ready within 24 months. AI training and inference workload at 40-50kW per rack. Power availability and speed-to-energize are the top priorities, followed by community receptiveness, then tax incentives. Prefer low water dependency. Renewable energy access is a plus but not required.";

type AppState = "input" | "loading" | "dossier";

export default function App() {
  const [view, setView] = useState<AppState>("input");
  const [requirements, setRequirements] = useState(DEMO_TEXT);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<"queued" | "running">("queued");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => () => stopPolling(), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoadingStatus("queued");
    setView("loading");

    let runId: string;
    try {
      runId = await startScreening(requirements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setView("input");
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const result = await pollScreening(runId);
        if (result.status === "succeeded") {
          stopPolling();
          setDossier(result.dossier);
          setView("dossier");
        } else {
          setLoadingStatus(result.status);
        }
      } catch (err) {
        stopPolling();
        setError(err instanceof Error ? err.message : "Unknown error");
        setView("input");
      }
    }, 2000);
  }

  if (view === "loading") return <LoadingView status={loadingStatus} />;
  if (view === "dossier" && dossier) return <DossierView dossier={dossier} requirements={requirements} />;
  return (
    <InputView
      requirements={requirements}
      onChange={setRequirements}
      onSubmit={handleSubmit}
      error={error}
    />
  );
}
