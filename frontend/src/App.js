import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import { runScreening, validateApiKey } from "./lib/api";
import { MOCK_DOSSIER } from "./lib/mockData";
import InputView from "./components/InputView";
import LoadingView from "./components/LoadingView";
import DossierView from "./components/DossierView";
const DEMO_TEXT = "50MW hyperscale facility. US Sun Belt or Midwest. Grid-ready within 24 months. AI training and inference workload at 40-50kW per rack. Power availability and speed-to-energize are the top priorities, followed by community receptiveness, then tax incentives. Prefer low water dependency. Renewable energy access is a plus but not required.";
const LS_KEY = "sitescope_api_key";
export default function App() {
    const [view, setView] = useState("input");
    const [requirements, setRequirements] = useState(DEMO_TEXT);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) ?? "");
    const [dossier, setDossier] = useState(null);
    const [isDemo, setIsDemo] = useState(false);
    const [error, setError] = useState(null);
    const [thinking, setThinking] = useState("");
    const [elapsed, setElapsed] = useState(0);
    const abortRef = useRef(null);
    const timerRef = useRef(null);
    function stopTimer() {
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }
    useEffect(() => () => { stopTimer(); abortRef.current?.abort(); }, []);
    function handleCancel() {
        abortRef.current?.abort();
        stopTimer();
        setView("input");
        setThinking("");
        setElapsed(0);
    }
    function handleDemo() {
        setIsDemo(true);
        setDossier(MOCK_DOSSIER);
        setView("dossier");
    }
    function handleForgetKey() {
        setApiKey("");
        localStorage.removeItem(LS_KEY);
    }
    const handleApiKeyChange = useCallback((val) => {
        setApiKey(val);
        if (val)
            localStorage.setItem(LS_KEY, val);
        else
            localStorage.removeItem(LS_KEY);
    }, []);
    async function handleSubmit(e) {
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
            const result = await runScreening(requirements, apiKey, controller.signal, (chunk) => setThinking((t) => t + chunk));
            stopTimer();
            setIsDemo(false);
            setDossier(result);
            setView("dossier");
        }
        catch (err) {
            stopTimer();
            if (err.name === "AbortError")
                return;
            setError(err instanceof Error ? err.message : "Unknown error");
            setView("input");
        }
    }
    if (view === "loading") {
        return (_jsx(LoadingView, { elapsed: elapsed, thinking: thinking, onCancel: handleCancel }));
    }
    if (view === "dossier" && dossier) {
        return (_jsx(DossierView, { dossier: dossier, requirements: requirements, isDemo: isDemo, onRunLive: () => setView("input") }));
    }
    return (_jsx(InputView, { requirements: requirements, onChange: setRequirements, apiKey: apiKey, onApiKeyChange: handleApiKeyChange, onForgetKey: handleForgetKey, onSubmit: handleSubmit, onDemo: handleDemo, error: error }));
}
