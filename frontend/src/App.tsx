import React, { useState, useEffect, useRef } from "react";
import { runScreening, validateApiKey } from "./lib/api";
import type { Dossier } from "./lib/types";
import { MOCK_DOSSIER, MOCK_QUERY } from "./lib/mockData";
import { MOCK_DOSSIER_2, MOCK_QUERY_2 } from "./lib/mockData2";
import InputView from "./components/InputView";
import LoadingView from "./components/LoadingView";
import DossierView from "./components/DossierView";
import DemoSelectView from "./components/DemoSelectView";

const LS_KEY = "sitescope_api_key";

type NavView = "input" | "demo-select" | "dossier";
type AppState = NavView | "loading";

export default function App() {
  const [view, setView] = useState<AppState>("input");
  const [requirements, setRequirements] = useState(MOCK_QUERY);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) ?? "");
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopTimer(): void {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function navigateTo(v: NavView): void {
    window.history.pushState({ view: v }, "");
    setView(v);
  }

  // Seed initial history entry and wire up popstate for back/forward.
  useEffect(() => {
    window.history.replaceState({ view: "input" }, "");

    function onPopState(e: PopStateEvent): void {
      const v = e.state?.view as NavView | undefined;
      if (!v) return;
      abortRef.current?.abort();
      stopTimer();
      setThinking("");
      setElapsed(0);
      setView(v);
    }

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      stopTimer();
      abortRef.current?.abort();
    };
  }, []);

  function handleCancel(): void {
    abortRef.current?.abort();
    stopTimer();
    setThinking("");
    setElapsed(0);
    navigateTo("input");
  }

  function handleDemo(): void {
    navigateTo("demo-select");
  }

  async function handleDemoSelect(which: 1 | 2): Promise<void> {
    const mockDossier = which === 1 ? MOCK_DOSSIER : MOCK_DOSSIER_2;
    const mockQuery = which === 1 ? MOCK_QUERY : MOCK_QUERY_2;

    setIsDemo(true);
    setRequirements(mockQuery);
    setElapsed(0);
    setView("loading");

    const controller = new AbortController();
    abortRef.current = controller;

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    try {
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, 5000);
        controller.signal.addEventListener("abort", () => {
          clearTimeout(t);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
      stopTimer();
      setDossier(mockDossier);
      navigateTo("dossier");
    } catch (err) {
      stopTimer();
    }
  }

  function handleForgetKey(): void {
    setApiKey("");
    localStorage.removeItem(LS_KEY);
  }

  function handleApiKeyChange(val: string): void {
    setApiKey(val);
    if (val) localStorage.setItem(LS_KEY, val);
    else localStorage.removeItem(LS_KEY);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setThinking("");
    setElapsed(0);
    setView("loading");

    const controller = new AbortController();
    abortRef.current = controller;

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    try {
      await validateApiKey(apiKey);
      const result = await runScreening(
        requirements,
        apiKey,
        controller.signal,
        (chunk) => setThinking((t) => t + chunk),
      );
      stopTimer();
      setIsDemo(false);
      setDossier(result);
      navigateTo("dossier");
    } catch (err) {
      stopTimer();
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
      navigateTo("input");
    }
  }

  if (view === "demo-select") {
    return (
      <DemoSelectView
        onSelect={handleDemoSelect}
        onBack={() => navigateTo("input")}
      />
    );
  }
  if (view === "loading") {
    return (
      <LoadingView
        elapsed={elapsed}
        thinking={thinking}
        onCancel={handleCancel}
      />
    );
  }
  if (view === "dossier" && dossier) {
    return (
      <DossierView
        dossier={dossier}
        requirements={requirements}
        isDemo={isDemo}
        onHome={() => navigateTo("input")}
        onRunLive={() => navigateTo("input")}
      />
    );
  }
  return (
    <InputView
      requirements={requirements}
      onChange={setRequirements}
      apiKey={apiKey}
      onApiKeyChange={handleApiKeyChange}
      onForgetKey={handleForgetKey}
      onSubmit={handleSubmit}
      onDemo={handleDemo}
      error={error}
    />
  );
}
