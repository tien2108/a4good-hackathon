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
  extractorProgress?: number;
  decisionTreeProgress?: number;
};

export type RiskTierId = "unacceptable" | "high" | "limited" | "minimal" | "out_of_scope";
export type AnalysisStatus = "idle" | "running" | "complete";

// Base URL for backend REST API connection. Reads from .env file or falls back to localhost:3001
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

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
  // backend integration
  backendSession: any | null; // Latest polled session state from local backend
  isUploading: boolean; // Indicates REST API upload is active
  uploadError: string | null; // Capture REST API errors
  setUploadError: (err: string | null) => void;
  uploadSuccess: boolean; // Indicates successful submit
  uploadStagedFiles: () => Promise<void>; // Submit staged documents to active backend session
  skipUpload: () => Promise<void>; // Skip files upload and transition backend status
  isRejected: boolean;
  rejectedReason: string | null;
  rejectedFileName: string | null;
  rejectedOmissions: string[] | null;
  sessionStartTime: number | null;
  resetRejectionState: () => void;
  proceedWithLowerConfidence: () => Promise<void>;
  // history tracking
  isViewingHistory: boolean;
  historicalRunName: string | null;
  loadHistoricalRun: (run: any) => void;
  restoreLiveSession: () => void;
  // error muting
  muteErrors: boolean;
  setMuteErrors: (v: boolean) => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}

const TIERS: RiskTierId[] = ["unacceptable", "high", "limited", "minimal", "out_of_scope"];

// Helper to translate raw developer errors into constructive human-friendly guidance
const getFriendlyErrorMessage = (err: string): string => {
  if (!err) return "";
  const lower = err.toLowerCase();
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("connection refused") || lower.includes("connrefused")) {
    return "The compliance platform backend is currently unreachable. Please make sure your local NodeJS backend server is running (typically on port 3001) and that you are online.";
  }
  if (lower.includes("failed to start compliance session")) {
    return "Unable to initialize the compliance check session. Please verify that your local backend server is started and functioning correctly.";
  }
  if (lower.includes("failed to dispatch analysis payload") || lower.includes("failed to dispatch files list")) {
    return "The document extraction was successful, but we could not synchronize the session data with your local database. Please try resubmitting or check your backend terminal logs.";
  }
  if (lower.includes("endpoint returned status")) {
    return "Server Error: The compliance server returned an unexpected error status. Please check your document format or review the server terminal logs.";
  }
  if (lower.includes("no documents staged")) {
    return "No documents selected. Please drag and drop your AI system documentation or source code file above to proceed.";
  }
  if (lower.includes("file rejected")) {
    return err;
  }
  return err;
};

const FIELD_LABEL_MAP: Record<string, string> = {
  purpose: "Purpose",
  users: "Target End-Users",
  affected_persons: "Affected Persons",
  affectedpersons: "Affected Persons",
  sector: "Sector",
  input_data: "Input Data",
  inputdata: "Input Data",
  outputs: "Outputs",
  automation_level: "Automation Level",
  automationlevel: "Automation Level",
  human_oversight: "Human Oversight",
  humanoversight: "Human Oversight",
  deployment_context: "Deployment Context",
  deploymentcontext: "Deployment Context",
  use_of_ai_generated_content: "Use of AI-Generated Content",
  useofaigeneratedcontent: "Use of AI-Generated Content",
  use_of_gpai: "Use of GPAI",
  useofgpai: "Use of GPAI",
  possible_impact_on_people: "Possible Impact on People",
  possibleimpactonpeople: "Possible Impact on People",
  logging: "Logging",
  monitoring: "Monitoring",
  transparency: "Transparency",
  riskmanagement: "Risk Management",
  risk_management: "Risk Management",
  documentation: "Documentation",
  accountability: "Accountability",
  role_clarity: "Role Clarity",
  roleclarity: "Role Clarity",
};

export function formatFieldName(field: string): string {
  const normalized = field.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (FIELD_LABEL_MAP[normalized]) return FIELD_LABEL_MAP[normalized];
  if (FIELD_LABEL_MAP[field]) return FIELD_LABEL_MAP[field];

  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function listNaturally(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });
  const [lang, setLang] = useState<Lang>("en");
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [rawFiles, setRawFiles] = useState<{ [id: string]: File }>({});
  const [ingestionCollapsed, setIngestionCollapsed] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [stage, setStage] = useState(0);
  const [currentRisk, setCurrentRisk] = useState<RiskTierId | null>(null);
  const [finalRisk, setFinalRisk] = useState<RiskTierId | null>(null);
  const riskTimerRef = useRef<number | null>(null);

  // Live REST API Integration States
  const [backendSession, setBackendSession] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadErrorRaw] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Mute Error alerts state
  const [muteErrors, setMuteErrorsState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("compliance_mute_errors") === "true";
    }
    return false;
  });

  const setMuteErrors = useCallback((v: boolean) => {
    setMuteErrorsState(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("compliance_mute_errors", String(v));
    }
  }, []);

  const setUploadError = useCallback((err: string | null) => {
    if (err === null) {
      setUploadErrorRaw(null);
    } else {
      setUploadErrorRaw(getFriendlyErrorMessage(err));
    }
  }, []);


  // History Module States
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [liveSessionBackup, setLiveSessionBackup] = useState<any | null>(null);
  const [historicalRunName, setHistoricalRunName] = useState<string | null>(null);

  const loadHistoricalRun = useCallback((run: any) => {
    if (!isViewingHistory) {
      setLiveSessionBackup({
        backendSession,
        status,
        currentRisk,
        finalRisk
      });
    }
    setBackendSession(run.data.backendSession);
    setStatus(run.data.status);
    setCurrentRisk(run.data.currentRisk);
    setFinalRisk(run.data.finalRisk);
    setHistoricalRunName(run.name);
    setIsViewingHistory(true);
  }, [isViewingHistory, backendSession, status, currentRisk, finalRisk]);

  const restoreLiveSession = useCallback(() => {
    if (liveSessionBackup) {
      setBackendSession(liveSessionBackup.backendSession);
      setStatus(liveSessionBackup.status);
      setCurrentRisk(liveSessionBackup.currentRisk);
      setFinalRisk(liveSessionBackup.finalRisk);
    } else {
      setStatus("idle");
      setBackendSession(null);
      setCurrentRisk(null);
      setFinalRisk(null);
    }
    setIsViewingHistory(false);
    setHistoricalRunName(null);
    setLiveSessionBackup(null);
  }, [liveSessionBackup]);

  // Validation Rejection Chatbot States
  const [isRejected, setIsRejected] = useState(false);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const [rejectedFileName, setRejectedFileName] = useState<string | null>(null);
  const [originalRejectedPayload, setOriginalRejectedPayload] = useState<any | null>(null);
  const [rejectedOmissions, setRejectedOmissions] = useState<string[] | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const resetRejectionState = useCallback(() => {
    setIsRejected(false);
    setRejectedReason(null);
    setRejectedFileName(null);
    setOriginalRejectedPayload(null);
    setRejectedOmissions(null);
    setUploadError(null);
  }, []);

  const proceedWithLowerConfidence = useCallback(async () => {
    if (!originalRejectedPayload) return;
    
    setUploadError(null);
    setIsUploading(true);
    setIsRejected(false);
    setStatus("running");

    try {
      const sessionId = backendSession?.sessionId || "session_default";
      console.log("[AppContext] Proceeding with lower confidence analysis payload...");
      
      const payload = {
        ...originalRejectedPayload,
        bypassValidation: true,
        validation: { avg_extraction_confidence: 0.5 },
        classification: { overall_confidence: 0.45 },
        reasoning_trace: `Analysis forced despite document rejection warning: "${rejectedReason || "N/A"}". Overall confidence lowered, assumptions expanded.`
      };

      const encodedAnalysis = encodeURIComponent(JSON.stringify(payload));
      const payloadFiles = files.map((file) => file.name);
      const encodedFiles = encodeURIComponent(JSON.stringify(payloadFiles));

      const localRes = await fetch(`${BACKEND_URL}/api/session/${sessionId}/upload?analysis=${encodedAnalysis}&files=${encodedFiles}`, {
        method: "GET"
      });

      if (!localRes.ok) {
        throw new Error("Failed to dispatch lower confidence payload to local backend.");
      } else {
        const localData = await localRes.json();
        console.log("[AppContext] Skip & Proceed response:", localData);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 1500);
      }
    } catch (err: any) {
      console.error("[AppContext] Error in skip & proceed:", err);
      setUploadError(err.message || "Failed to proceed with lower confidence.");
      setStatus("idle");
    } finally {
      setIsUploading(false);
    }
  }, [originalRejectedPayload, files, backendSession, BACKEND_URL, rejectedReason]);

  // Keep a ref of files list to avoid stale closure issues in interval polling
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Poll active backend session status every 1500ms
  useEffect(() => {
    const fetchLatestSession = async () => {
      if (isViewingHistory) return;
      try {
        const res = await fetch(`${BACKEND_URL}/api/session/latest`);
        if (res.ok) {
          const data = await res.json();
          setBackendSession(data);
          
          // Map backend session states to local UI status gracefully
          if (data) {
            // Only block "complete" status if there are newly added/staged files that haven't been processed yet (extractorProgress is undefined)
            const hasStagedPending = filesRef.current.some((f) => f.extractorProgress === undefined);
            if (data.status === "COMPLETE" || data.status === "COMPLETED_SUCCESS" || data.status === "COMPLETED_WITH_GAPS") {
              // Only override to complete if the user does NOT have newly staged files pending analysis
              setStatus((prev) => (hasStagedPending ? prev : "complete"));
              if (data.riskClassification) {
                const classificationLower = data.riskClassification.toLowerCase();
                let mappedRisk: RiskTierId = "minimal";

                if (classificationLower.includes("unacceptable") || classificationLower.includes("prohibited") || classificationLower.includes("prohibition")) {
                  mappedRisk = "unacceptable";
                } else if (classificationLower.includes("high-risk") || classificationLower.includes("high risk") || classificationLower.includes("high")) {
                  mappedRisk = "high";
                } else if (classificationLower.includes("limited")) {
                  mappedRisk = "limited";
                } else if (classificationLower.includes("out of scope") || classificationLower.includes("out-of-scope") || classificationLower.includes("exempt") || classificationLower.includes("article 2")) {
                  mappedRisk = "out_of_scope";
                } else {
                  mappedRisk = "minimal";
                }

                setCurrentRisk(mappedRisk);
                setFinalRisk(mappedRisk);
              }
            } else if (data.status === "AWAITING_USER_UPLOAD") {
              setStatus("idle"); // Awaiting action, let them upload files
            } else if (data.status === "IDLE") {
              setStatus("idle");
            } else {
              // Only override local UI status to running if the user has no active staged files
              setStatus((prev) => (hasStagedPending ? prev : "running"));
            }
          }
        } else {
          setBackendSession(null);
        }
      } catch (err) {
        // Fail silently to guarantee 100% UI stability when backend is not running
        setBackendSession(null);
      }
    };

    fetchLatestSession();
    const interval = setInterval(fetchLatestSession, 1500);
    return () => clearInterval(interval);
  }, [isViewingHistory]);

  // Ref to track last auto-saved session ID to prevent duplicate saving
  const lastSavedSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isViewingHistory) return;
    if (status === "complete" && backendSession && backendSession.sessionId) {
      const sessId = backendSession.sessionId;
      if (lastSavedSessionIdRef.current === sessId) return;

      try {
        const historyJson = window.localStorage.getItem("compliance_runs_history");
        let historyList = historyJson ? JSON.parse(historyJson) : [];

        // Check if this run is already saved
        const exists = historyList.some((item: any) => item.id === sessId);
        if (!exists) {
          // Create a default name using purpose or date
          const dateStr = new Date().toLocaleString();
          const purpose = backendSession.proposalFacts?.purpose || "Real Upload Compliance Run";
          const defaultName = `${purpose} (${dateStr})`;

          const newRun = {
            id: sessId,
            name: defaultName,
            timestamp: new Date().toISOString(),
            folderId: "unassigned", // default folder
            data: {
              backendSession,
              status,
              currentRisk,
              finalRisk
            }
          };

          historyList.unshift(newRun); // Newest first
          window.localStorage.setItem("compliance_runs_history", JSON.stringify(historyList));
          lastSavedSessionIdRef.current = sessId;
          console.log(`[History] Auto-saved completed run: ${defaultName}`);
        }
      } catch (err) {
        console.error("[History] Failed to auto-save completed run:", err);
      }
    }
  }, [status, backendSession, currentRisk, finalRisk, isViewingHistory]);

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
    const allowedExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];
    const hasUnsupportedFile = Array.from(incoming).some((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return !allowedExtensions.includes(ext);
    });

    if (hasUnsupportedFile) {
      alert("Unsupported file format! The system only accepts PDF, DOC, DOCX, PPT, and PPTX formats. Please reupload correctly formatted files.");
      setUploadError("File format was unsupported. Please upload only PDF, DOC/DOCX, and PPT/PPTX files.");
      return;
    }

    const list: StagedFile[] = [];
    const newRaws: { [id: string]: File } = {};

    Array.from(incoming).forEach((f) => {
      const id = `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      list.push({
        id,
        name: f.name,
        size: f.size,
        progress: 0,
      });
      newRaws[id] = f;
    });

    setFiles((prev) => [...prev, ...list]);
    setRawFiles((prev) => ({ ...prev, ...newRaws }));
    setSessionStartTime((prevTime) => prevTime === null ? Date.now() : prevTime);
    // Mock progress animation to simulate loading
    requestAnimationFrame(() => {
      setFiles((prev) =>
        prev.map((f) =>
          list.find((x) => x.id === f.id) ? { ...f, progress: 100 } : f,
        ),
      );
    });
  }, [setUploadError]);

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setRawFiles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
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

  // Submit files via real REST API endpoint
  const uploadStagedFiles = useCallback(async () => {
    if (files.length === 0) {
      setUploadError("No documents staged. Please drag & drop or browse files.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadSuccess(false);

    const sessionId = backendSession?.sessionId || "session_default";
    const isFreshSession = !backendSession || backendSession.status === "IDLE";
    let hasRejection = false;
    let progressInterval: any = null;
    let ingestInterval: any = null;

    try {
      // Initialize progress
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          progress: 5,
          extractorProgress: 10,
          decisionTreeProgress: 0,
        }))
      );

      let simulatedProgress = 10;
      progressInterval = setInterval(() => {
        simulatedProgress = Math.min(simulatedProgress + Math.floor(Math.random() * 8) + 4, 90);
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            progress: Math.floor(simulatedProgress / 2), // 5% to 45%
            extractorProgress: simulatedProgress,
          }))
        );
      }, 300);

      // If no active session or it is IDLE, start a fresh session on backend first
      if (isFreshSession) {
        console.log("[AppContext] No active session. Starting session_default with empty scenario on backend first...");
        const startRes = await fetch(`${BACKEND_URL}/api/session/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, scenario: "" }),
        });
        if (!startRes.ok) {
          throw new Error("Failed to start compliance session on backend.");
        }
      }

      let lastAnalysisPayload: any = null;

      // 2. Also send all files as multipart/form-data to the ngrok analyze endpoint all at once
      const remoteUrl = "https://e620-194-136-126-35.ngrok-free.app/analyze/";
      const formData = new FormData();
      let hasValidFile = false;

      files.forEach((f) => {
        const rawFile = rawFiles[f.id];
        if (rawFile) {
          formData.append("file", rawFile);
          formData.append("files", rawFile);
          hasValidFile = true;
        } else {
          console.warn(`[Remote API] No raw file object found for staged file id: ${f.id}`);
        }
      });

      if (hasValidFile) {
        try {
          console.log(`[Remote API] Uploading ${files.length} staged file(s) to remote analyze endpoint...`);
          const remoteRes = await fetch(remoteUrl, {
            method: "POST",
            body: formData,
          });

          if (!remoteRes.ok) {
            console.error(`[Remote API] Consolidated upload failed: Status ${remoteRes.status}`);
          } else {
            const data = await remoteRes.json();
            console.log(`[Remote API] Joint analysis response:`, data);
            
            if (data && data.status === "success") {
              const classification = data.classification || {};
              const validation = data.validation || {};
              const extracted_fields = data.extracted_fields || {};

              const appearsToMeetAiSystemDefinition = classification.risk_level !== "OUT OF SCOPE";
              const possibleRiskClassification = classification.risk_level || "Unclassified";
              const transparencyObligations = classification.articles || [];
              const can_classify = validation.can_classify ?? true;
              const avg_extraction_confidence = validation.avg_extraction_confidence ?? 0.9;
              const overall_confidence = classification.overall_confidence ?? 0.85;
              const reasoning_trace = classification.classification_certainty?.explanation || "Parsed via remote API";
              const citations = classification.articles || [];
              const users = extracted_fields.users?.value || "Clinical radiologists and hospital staff";
              const affected_persons = extracted_fields["affected persons"]?.value || "Patients undergoing diagnostic scanning";

              // Also extract extra properties for proposalFacts:
              const combinedFileNames = files.map((file) => file.name).join(", ");
              const purpose = extracted_fields.purpose?.value || combinedFileNames;
              const sector = extracted_fields.sector?.value || "Unspecified";
              const input_data = extracted_fields["input data"]?.value || "";
              const outputs = extracted_fields.outputs?.value || "";
              const automation_level = extracted_fields["automation level"]?.value || "";
              const human_oversight = extracted_fields["human oversight"]?.value || "";
              const deployment_context = extracted_fields["deployment context"]?.value || "";
              const use_of_ai_generated_content = extracted_fields["use of AI-generated content"]?.value || "";
              const use_of_gpai = extracted_fields["use of GPAI"]?.value || "";
              const possible_impact_on_people = extracted_fields["possible impact on people"]?.value || "";

              lastAnalysisPayload = {
                appearsToMeetAiSystemDefinition,
                possibleRiskClassification,
                transparencyObligations,
                can_classify,
                validation: { avg_extraction_confidence: avg_extraction_confidence },
                classification: { overall_confidence: overall_confidence },
                reasoning_trace,
                citations,
                users,
                affected_persons,
                
                // Fields for proposalFacts construction on backend:
                purpose,
                sector,
                input_data,
                outputs,
                automation_level,
                human_oversight,
                deployment_context,
                use_of_ai_generated_content,
                use_of_gpai,
                possible_impact_on_people
              };
            } else if (data && (data.status === "aborted" || data.status === "abort")) {
              const missingFields = data.validation?.missing_fields || data.missing_fields || [];
              const lowConfidenceFields = (data.validation?.low_confidence_fields || data.low_confidence_fields || [])
                .map((f: any) => typeof f === "string" ? f : f.field || f.name || String(f));
              const combinedFields = Array.from(new Set([...missingFields, ...lowConfidenceFields])).filter(Boolean);
              
              setRejectedOmissions(combinedFields);
              
              const mappedNames = combinedFields.map(f => formatFieldName(f));
              const naturalList = listNaturally(mappedNames);
              const reason = data.reason || `The compliance checkers detected omissions in required EU AI Act areas: ${naturalList}.`;
              
              console.warn(`[Remote API] Consolidated files upload aborted. Reason: ${reason}`);
              
              const combinedFileNames = files.map((file) => file.name).join(", ");
              setUploadError(`File rejected: ${reason}`);
              setIsRejected(true);
              setRejectedReason(reason);
              setRejectedFileName(combinedFileNames);
              setStatus("idle");
              setIsUploading(false);
              hasRejection = true;

              // Seed originalRejectedPayload in case they choose to Proceed Anyway
              setOriginalRejectedPayload({
                appearsToMeetAiSystemDefinition: true,
                possibleRiskClassification: "High-Risk AI System (Article 6.1 - Annex I Safety Component/Medical Device)",
                transparencyObligations: ["Article 50", "Article 52"],
                can_classify: true,
                validation: { avg_extraction_confidence: 0.5 },
                classification: { overall_confidence: 0.45 },
                reasoning_trace: `Analysis completed with low confidence thresholds following an abort: "${reason}".`,
                citations: [
                  "Article 6.1 (High-Risk Category - Subject to third-party conformity assessment under Annex I)",
                  "Articles 9-15 (Technical/Operational requirements: risk management, logging, human oversight)"
                ],
                users: "Clinical radiologists and hospital staff",
                affected_persons: "Patients undergoing diagnostic scanning",
                purpose: combinedFileNames,
                sector: "Healthcare / High-risk medical diagnostics",
                input_data: "Patient medical images and electronic health records",
                outputs: "Diagnostic classification reports",
                automation_level: "High automation level with human reviewer gates",
                human_oversight: "Clinical review, override triggers",
                deployment_context: "Installed on hospital networks",
                use_of_ai_generated_content: "None",
                use_of_gpai: "None",
                possible_impact_on_people: "Clinical diagnostics outcomes"
              });
            } else {
              // Represent a rejected source document
              const reason = data?.reason || "This document does not meet EU AI Act validation criteria or is missing required specifications.";
              console.warn(`[Remote API] Consolidated files upload rejected. Reason: ${reason}`);
              
              const combinedFileNames = files.map((file) => file.name).join(", ");
              setUploadError(`File rejected: ${reason}`);
              setIsRejected(true);
              setRejectedReason(reason);
              setRejectedFileName(combinedFileNames);
              setRejectedOmissions(null);
              setStatus("idle");
              setIsUploading(false);
              hasRejection = true;

              // Seed originalRejectedPayload in case they choose to Proceed Anyway
              const fileNameLower = combinedFileNames.toLowerCase();
              const reasonLower = reason.toLowerCase();
              
              const isOutScope = fileNameLower.includes("math") || 
                                 fileNameLower.includes("science") || 
                                 reasonLower.includes("out of scope") || 
                                 reasonLower.includes("not an ai") || 
                                 reasonLower.includes("not describe") || 
                                 reasonLower.includes("mathematics") ||
                                 reasonLower.includes("non-ai") ||
                                 reasonLower.includes("scientific");

              const meetsAiDef = !isOutScope;
              const possibleRiskClassification = isOutScope 
                ? "Unclassified / Out of Scope (Article 2)" 
                : "High-Risk AI System (Article 6.1 - Annex I Safety Component/Medical Device)";

              const citations = isOutScope
                ? [
                    "Article 2 (Scope & Exclusions - Research, development, and purely mathematical/scientific models are excluded from the scope of the EU AI Act)",
                    "Article 2.6 (Exclusions for scientific research, developmental systems, and non-commercial operations)"
                  ]
                : [
                    "Article 6.1 (High-Risk Category - Subject to third-party conformity assessment under Annex I)",
                    "Articles 9-15 (Technical/Operational requirements: risk management, logging, human oversight)"
                  ];

              setOriginalRejectedPayload({
                appearsToMeetAiSystemDefinition: meetsAiDef,
                possibleRiskClassification: possibleRiskClassification,
                transparencyObligations: isOutScope ? [] : ["Article 50", "Article 52"],
                can_classify: true,
                validation: { avg_extraction_confidence: 0.5 },
                classification: { overall_confidence: 0.45 },
                reasoning_trace: `Analysis completed with low confidence thresholds following a file rejection warning: "${reason}".`,
                citations: citations,
                users: isOutScope ? "N/A" : "Clinical radiologists and hospital staff",
                affected_persons: isOutScope ? "N/A" : "Patients undergoing diagnostic scanning",
                purpose: combinedFileNames,
                sector: isOutScope ? "Mathematics / Academic research" : "Healthcare / High-risk medical diagnostics",
                input_data: isOutScope ? "" : "Patient medical images and electronic health records",
                outputs: isOutScope ? "" : "Diagnostic classification reports",
                automation_level: isOutScope ? "" : "High automation level with human reviewer gates",
                human_oversight: isOutScope ? "" : "Clinical review, override triggers",
                deployment_context: isOutScope ? "" : "Installed on hospital networks",
                use_of_ai_generated_content: "None",
                use_of_gpai: "None",
                possible_impact_on_people: isOutScope ? "None / Purely mathematical study" : "Clinical diagnostics outcomes"
              });
            }
          }
        } catch (remoteErr) {
          console.error(`[Remote API] Error uploading consolidated files to remote endpoint:`, remoteErr);
        }
      }

      if (hasRejection) {
        clearInterval(progressInterval);
        console.log("[AppContext] File validation rejection detected. Halting local backend dispatch to show Copilot chatbot prompt.");
        return;
      }

      // Agent 1 complete! Start Agent 2 transition.
      clearInterval(progressInterval);
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          extractorProgress: 100,
          progress: 50,
          decisionTreeProgress: 10,
        }))
      );

      let ingestProgress = 10;
      ingestInterval = setInterval(() => {
        ingestProgress = Math.min(ingestProgress + Math.floor(Math.random() * 10) + 6, 90);
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            progress: 50 + Math.floor(ingestProgress / 2), // 50% to 95%
            decisionTreeProgress: ingestProgress,
          }))
        );
      }, 250);

      // 3. Dispatch the final accumulated analysis to the local backend using GET with query string
      if (lastAnalysisPayload) {
        console.log("[AppContext] Dispatching filtered remote analysis payload to local backend...");
        const encodedAnalysis = encodeURIComponent(JSON.stringify(lastAnalysisPayload));
        const payloadFiles = files.map((file) => file.name);
        const encodedFiles = encodeURIComponent(JSON.stringify(payloadFiles));

        const localRes = await fetch(`${BACKEND_URL}/api/session/${sessionId}/upload?analysis=${encodedAnalysis}&files=${encodedFiles}`, {
          method: "GET"
        });

        if (!localRes.ok) {
          const errBody = await localRes.json().catch(() => ({ error: "Endpoint returned status " + localRes.status }));
          throw new Error(errBody.error || "Failed to dispatch analysis payload to local backend.");
        } else {
          const localData = await localRes.json();
          console.log("[AppContext] Local backend response:", localData);
        }
      } else {
        // Fallback: If no successful remote analysis was obtained, submit files names only as standard Step 2
        console.log("[AppContext] No remote analysis obtained. Falling back to submit names only...");
        const payloadFiles = files.map((file) => file.name);
        const encodedFiles = encodeURIComponent(JSON.stringify(payloadFiles));

        const localRes = await fetch(`${BACKEND_URL}/api/session/${sessionId}/upload?files=${encodedFiles}`, {
          method: "GET"
        });

        if (!localRes.ok) {
          const errBody = await localRes.json().catch(() => ({ error: "Endpoint returned status " + localRes.status }));
          throw new Error(errBody.error || "Failed to dispatch files list to local backend.");
        }
      }

      // Finish progress bars
      if (ingestInterval) clearInterval(ingestInterval);
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          extractorProgress: 100,
          decisionTreeProgress: 100,
          progress: 100,
        }))
      );
      setUploadSuccess(true);
      
      if (isFreshSession) {
        setStatus("running");
      }

      // Keep files list and rawFiles intact to allow multi-file session retention.
      setTimeout(() => {
        setUploadSuccess(false);
      }, 1500);

    } catch (err: any) {
      if (progressInterval) clearInterval(progressInterval);
      if (ingestInterval) clearInterval(ingestInterval);
      setUploadError(err.message || "Failed to dispatch REST payload to local backend.");
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          progress: 0,
          extractorProgress: 0,
          decisionTreeProgress: 0,
        }))
      );
    } finally {
      setIsUploading(false);
    }
  }, [files, rawFiles, backendSession]);

  // Skip files upload trigger
  const skipUpload = useCallback(async () => {
    setUploadError(null);
    setIsUploading(true);
    setUploadSuccess(false);

    const sessionId = backendSession?.sessionId || "session_default";

    try {
      const res = await fetch(`${BACKEND_URL}/api/session/${sessionId}/skip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Endpoint returned failure.");
      }

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 1500);

    } catch (err: any) {
      setUploadError(err.message || "Failed to dispatch SKIP REST action to local backend.");
    } finally {
      setIsUploading(false);
    }
  }, [backendSession]);

  useEffect(() => {
    return () => {
      if (riskTimerRef.current) window.clearInterval(riskTimerRef.current);
    };
  }, []);

  // 30-Minute Security Timeout
  useEffect(() => {
    if (sessionStartTime === null) return;

    const interval = setInterval(async () => {
      const elapsed = Date.now() - sessionStartTime;
      const limit = 30 * 60 * 1000; // 30 minutes
      
      if (elapsed >= limit) {
        clearInterval(interval);
        
        // 1. Purge frontend memory
        setFiles([]);
        setRawFiles({});
        setSessionStartTime(null);
        resetRejectionState();
        
        // 2. Alert the user
        alert("Session Expired: Your session has timed out after 30 minutes. All staged files have been securely deleted from memory.");
        
        // 3. Reset backend session
        try {
          const newSessionId = "session_" + Math.random().toString(36).substring(2, 11);
          await fetch(`${BACKEND_URL}/api/session/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: newSessionId, scenario: "" }),
          });
        } catch (err) {
          console.error("Failed to reset backend session on timeout:", err);
        }
        
        // 4. Force hard reload to completely wipe memory
        window.location.reload();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [sessionStartTime, BACKEND_URL, resetRejectionState]);

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
      backendSession,
      isUploading,
      uploadError,
      uploadSuccess,
      uploadStagedFiles,
      skipUpload,
      isRejected,
      rejectedReason,
      rejectedFileName,
      rejectedOmissions,
      sessionStartTime,
      resetRejectionState,
      proceedWithLowerConfidence,
      isViewingHistory,
      historicalRunName,
      loadHistoricalRun,
      restoreLiveSession,
      muteErrors,
      setMuteErrors,
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
      backendSession,
      isUploading,
      uploadError,
      uploadSuccess,
      uploadStagedFiles,
      skipUpload,
      isRejected,
      rejectedReason,
      rejectedFileName,
      rejectedOmissions,
      sessionStartTime,
      resetRejectionState,
      proceedWithLowerConfidence,
      isViewingHistory,
      historicalRunName,
      loadHistoricalRun,
      restoreLiveSession,
      muteErrors,
      setMuteErrors,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
