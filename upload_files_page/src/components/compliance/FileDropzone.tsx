import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  X,
  FileSpreadsheet,
  FileType2,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  Bot,
  MessageSquare,
} from "lucide-react";
import { useApp } from "./AppContext";

const ACCEPTED = ".pdf,.doc,.docx,.ppt,.pptx";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "csv") return FileSpreadsheet;
  if (ext === "pdf") return FileType2;
  return FileText;
}

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

function formatFieldName(field: string): string {
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

function listNaturally(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function FileDropzone() {
  const {
    files,
    addFiles,
    removeFile,
    ingestionCollapsed,
    setIngestionCollapsed,
    t,
    backendSession,
    isUploading,
    uploadError,
    setUploadError,
    uploadSuccess,
    uploadStagedFiles,
    skipUpload,
    isRejected,
    rejectedReason,
    rejectedFileName,
    rejectedOmissions,
    resetRejectionState,
    proceedWithLowerConfidence,
    muteErrors,
    setMuteErrors,
  } = useApp();

  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = useCallback(() => inputRef.current?.click(), []);

  useEffect(() => {
    const onDocDragOver = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragover", onDocDragOver);
    document.addEventListener("drop", onDocDragOver);
    return () => {
      document.removeEventListener("dragover", onDocDragOver);
      document.removeEventListener("drop", onDocDragOver);
    };
  }, []);

  const hasFiles = files.length > 0;
  const collapsed = hasFiles && ingestionCollapsed;

  const isAwaitingBackendUpload = backendSession?.status === "AWAITING_USER_UPLOAD";
  
  // Combine raw missingFields, dt validation missing_fields, and dt validation low_confidence_fields
  const rawMissingFields = backendSession?.missingFields || [];
  const dtMissingFields = backendSession?.decisionTreePayload?.validation?.missing_fields || [];
  const dtLowConfidenceFields = (backendSession?.decisionTreePayload?.validation?.low_confidence_fields || [])
    .map((item: any) => typeof item === "string" ? item : item.field);

  // Combine and deduplicate
  const allUniqueOmissions = Array.from(new Set([
    ...rawMissingFields,
    ...dtMissingFields,
    ...dtLowConfidenceFields
  ])).filter(Boolean);

  const formattedOmissions = allUniqueOmissions.map(formatFieldName);
  const naturalOmissionsList = listNaturally(formattedOmissions);

  const sessionId = backendSession?.sessionId || "session_default";

  return (
    <div className="space-y-5">
      {/* Session State Alert Bar */}
      {backendSession && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>
              Connected Session: <strong className="font-semibold text-foreground">{sessionId}</strong>
            </span>
          </div>
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wider text-foreground">
            {backendSession.status}
          </span>
        </div>
      )}

      {/* Action Required Notice Panel */}
      {isAwaitingBackendUpload && (
        <div id="action-required-alert" className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-[0_4px_24px_-10px_rgba(245,158,11,0.15)] animate-fade-in">
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-500/5 blur-xl"></div>
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold tracking-tight text-amber-800 dark:text-amber-300">
                Action Required: Supplementary Files Requested
              </h4>
              <p className="text-xs leading-relaxed text-amber-700/80 dark:text-amber-300/70">
                The compliance checkers detected omissions in required EU AI Act areas:{" "}
                <span className="font-semibold text-amber-900 dark:text-amber-200">
                  {naturalOmissionsList}
                </span>
                . Please upload supplementary documents to resolve these gaps.
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        id="file-input"
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {collapsed ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 shadow-sm transition-all hover:bg-muted/50">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand text-white shadow-glow">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {files.length} {t("ingest.staged")}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {files.map((f) => f.name).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onPick}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Plus className="h-3 w-3" /> {t("ingest.addMore")}
            </button>
            <button
              type="button"
              onClick={() => setIngestionCollapsed(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
              aria-label={t("ingest.expand")}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <>          {isRejected ? (
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 dark:border-amber-500/40 bg-white dark:bg-zinc-950/90 p-6 shadow-[0_4px_30px_rgba(245,158,11,0.05)] dark:shadow-[0_4px_30px_rgba(245,158,11,0.15)] animate-fade-in text-left">
              {/* Subtle background glow */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-2xl pointer-events-none"></div>
              
              {/* Chatbot Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4 mb-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/25 shadow-glow">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    Compliance Copilot <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">AI Assistant</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Document Analysis & Validation Gate</p>
                </div>
              </div>

              {/* Chat Dialog Bubble */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="rounded-2xl rounded-tl-none bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-4 text-xs md:text-sm text-slate-800 dark:text-stone-200 leading-relaxed shadow-sm">
                      <p className="mb-2">
                        Hello! I analyzed your document <strong className="text-amber-600 dark:text-amber-300 font-semibold">{rejectedFileName}</strong>, but unfortunately, it was rejected due to compliance validation criteria:
                      </p>
                      
                      <div className="my-3 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-amber-500/20 p-3.5 text-slate-700 dark:text-stone-300 border-l-4 border-l-amber-500 text-xs font-mono leading-relaxed italic">
                        "{rejectedReason}"
                      </div>
                      
                      {rejectedOmissions && rejectedOmissions.length > 0 && (
                        <div className="my-3 space-y-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
                          <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                            The compliance checkers detected omissions or low confidence in the following required EU AI Act areas:
                          </p>
                          <ul className="list-disc pl-5 text-xs text-amber-800 dark:text-amber-400 space-y-1">
                            {rejectedOmissions.map((omission) => (
                              <li key={omission}>
                                <strong className="font-semibold">{formatFieldName(omission)}</strong> (Missing or Low Extraction Confidence)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <p>
                        Please upload an updated or supplementary document that satisfies these requirements. Alternatively, you can bypass this step and proceed anyway with a lower extraction confidence and more assumptions made.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Copilot Action Buttons */}
                <div className="flex flex-wrap gap-2.5 pt-2 pl-11">
                  <button
                    type="button"
                    onClick={onPick}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-brand px-4 text-xs font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Upload Supplementary Document
                  </button>
                  
                  <button
                    type="button"
                    onClick={proceedWithLowerConfidence}
                    disabled={isUploading}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-800 dark:hover:text-amber-200 transition-all cursor-pointer"
                  >
                    Proceed Anyway (Low Confidence)
                  </button>

                  <button
                    type="button"
                    onClick={resetRejectionState}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.98] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor="file-input"
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
              }}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                dragOver
                  ? "border-[color:var(--brand-via)] bg-[color:var(--brand-via)]/5"
                  : "border-border bg-muted/30 hover:border-[color:var(--brand-via)]/50 hover:bg-muted/50"
              }`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand shadow-glow">
                <UploadCloud className="h-6 w-6 text-white" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                {t("drop.title")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("drop.or")}{" "}
                <span className="font-medium text-[color:var(--brand-via)]">{t("drop.browse")}</span>{" "}
                · {t("drop.formats")}
              </p>
            </label>
          )}

          {hasFiles && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Staged Documents
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {files.length} document{files.length > 1 ? "s" : ""}
                </span>
              </div>

              <ul className="space-y-3">
                {files.map((f) => {
                  const Icon = iconFor(f.name);

                  return (
                    <li
                      key={f.id}
                      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[color:var(--brand-via)]/30"
                    >
                      {/* File Card Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand/10 text-[color:var(--brand-via)]">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {f.name}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              {formatSize(f.size)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeFile(f.id)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {isUploading ? (
                        <div className="space-y-3 mt-1 pt-1 border-t border-border/40">
                          {/* Agent 1 Progress */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-medium">
                              <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                                <span className={`h-1.5 w-1.5 rounded-full bg-cyan-500 ${f.extractorProgress && f.extractorProgress < 100 ? "animate-pulse shadow-glow-cyan" : ""}`} />
                                Agent 1: Document Extractor
                              </span>
                              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{f.extractorProgress || 0}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-cyan-950/10 dark:bg-cyan-950/30">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-[width] duration-300 ease-out"
                                style={{ width: `${f.extractorProgress || 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Agent 2 Progress */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-medium">
                              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                                <span className={`h-1.5 w-1.5 rounded-full bg-purple-500 ${f.decisionTreeProgress && f.decisionTreeProgress > 0 && f.decisionTreeProgress < 100 ? "animate-pulse shadow-glow-purple" : ""}`} />
                                Agent 2: Decision Tree Ingestor
                              </span>
                              <span className="text-purple-600 dark:text-purple-400 font-bold">{f.decisionTreeProgress || 0}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-purple-950/10 dark:bg-purple-950/30">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-[width] duration-300 ease-out"
                                style={{ width: `${f.decisionTreeProgress || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Progress Line */
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-brand transition-[width] duration-700 ease-out"
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* REST API Call feedback panels */}
              {uploadError && !muteErrors && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 dark:bg-destructive/5 p-4 text-xs text-destructive animate-shake shadow-lg backdrop-blur-md relative">
                  {/* Dismiss X button */}
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="absolute top-3 right-3 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-lg p-1 transition-colors cursor-pointer"
                    aria-label="Dismiss error"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex gap-2 pr-6">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <span className="font-semibold block">Regulatory Pipeline Failure</span>
                      <p className="text-destructive/80 leading-relaxed">{uploadError}</p>
                      
                      {/* Silence Toggle Switch */}
                      <div className="pt-2 border-t border-destructive/10 flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={muteErrors}
                            onChange={(e) => setMuteErrors(e.target.checked)}
                            className="rounded border-destructive/30 text-destructive focus:ring-destructive bg-transparent h-3.5 w-3.5 cursor-pointer"
                          />
                          <span className="text-[10px] text-destructive/70 hover:text-destructive transition-colors">
                            Silence future error alerts (can be re-enabled anytime)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {uploadSuccess && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="font-medium">
                      All files uploaded successfully to active compliance session! Rerunning agents...
                    </span>
                  </div>
                </div>
              )}

              {/* Interactive Submit API Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isUploading || uploadSuccess}
                  onClick={uploadStagedFiles}
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-brand text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading via REST API...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Upload & Submit Compliance Files
                    </>
                  )}
                </button>

                {isAwaitingBackendUpload && (
                  <button
                    type="button"
                    disabled={isUploading || uploadSuccess}
                    onClick={skipUpload}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.99] cursor-pointer"
                  >
                    Skip Upload <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Inline Collapse Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIngestionCollapsed(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <ChevronUp className="h-3 w-3" /> {t("ingest.collapse")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
