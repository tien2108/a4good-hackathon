import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DICTS, type Lang } from "./i18n";

export type StagedFile = {
  id: string;
  name: string;
  size: number;
  progress: number;
};

export type RiskTierId = "unacceptable" | "high" | "limited" | "minimal";
export type AnalysisStatus = "idle" | "running" | "complete";

type AppCtx = {
  // theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  // language
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  // workspace
  files: StagedFile[];
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  ingestionCollapsed: boolean;
  setIngestionCollapsed: (v: boolean) => void;
  status: AnalysisStatus;
  startAnalysis: () => void;
  stage: number;
  // risk
  currentRisk: RiskTierId | null;
  finalRisk: RiskTierId | null;
};

const Ctx = createContext<AppCtx | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}

const TIERS: RiskTierId[] = ["unacceptable", "high", "limited", "minimal"];

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  const [lang, setLang] = useState<Lang>("en");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [ingestionCollapsed, setIngestionCollapsed] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [stage, setStage] = useState(0);
  const [currentRisk, setCurrentRisk] = useState<RiskTierId | null>(null);
  const [finalRisk, setFinalRisk] = useState<RiskTierId | null>(null);
  const riskTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  const t = useCallback(
    (key: string) => DICTS[lang][key] ?? DICTS.en[key] ?? key,
    [lang],
  );

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list: StagedFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...list]);
    // Auto-collapse the dropzone once files staged
    setIngestionCollapsed(true);
    // Mock progress animation
    requestAnimationFrame(() => {
      setFiles((prev) =>
        prev.map((f) =>
          list.find((x) => x.id === f.id) ? { ...f, progress: 100 } : f,
        ),
      );
    });
  }, []);

  const removeFile = useCallback(
    (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id)),
    [],
  );

  const startAnalysis = useCallback(() => {
    if (status === "running") return;
    setStatus("running");
    setStage(0);
    setFinalRisk(null);
    // Cycle random risk tiers while running
    setCurrentRisk(TIERS[Math.floor(Math.random() * TIERS.length)]);
    if (riskTimerRef.current) window.clearInterval(riskTimerRef.current);
    riskTimerRef.current = window.setInterval(() => {
      setCurrentRisk(TIERS[Math.floor(Math.random() * TIERS.length)]);
    }, 650);

    const stageId = window.setInterval(() => {
      setStage((s) => {
        if (s >= 2) {
          window.clearInterval(stageId);
          // Settle the analysis
          window.setTimeout(() => {
            if (riskTimerRef.current) {
              window.clearInterval(riskTimerRef.current);
              riskTimerRef.current = null;
            }
            const settled = TIERS[Math.floor(Math.random() * TIERS.length)];
            setCurrentRisk(settled);
            setFinalRisk(settled);
            setStatus("complete");
          }, 1200);
          return s;
        }
        return s + 1;
      });
    }, 1400);
  }, [status]);

  useEffect(() => {
    return () => {
      if (riskTimerRef.current) window.clearInterval(riskTimerRef.current);
    };
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      theme,
      toggleTheme,
      lang,
      setLang,
      t,
      files,
      addFiles,
      removeFile,
      ingestionCollapsed,
      setIngestionCollapsed,
      status,
      startAnalysis,
      stage,
      currentRisk,
      finalRisk,
    }),
    [
      theme,
      toggleTheme,
      lang,
      t,
      files,
      addFiles,
      removeFile,
      ingestionCollapsed,
      status,
      startAnalysis,
      stage,
      currentRisk,
      finalRisk,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
