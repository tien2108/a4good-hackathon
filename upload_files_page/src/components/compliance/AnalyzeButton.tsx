import { Loader2, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { useApp } from "./AppContext";

export function AnalyzeButton() {
  const {
    status,
    stage,
    startAnalysis,
    t,
    files,
    uploadStagedFiles,
    isUploading,
    uploadSuccess,
    backendSession,
  } = useApp();

  const running = status === "running" || isUploading;
  const stages = [t("analyze.stage.1"), t("analyze.stage.2"), t("analyze.stage.3")];

  const hasStagedFiles = files.length > 0;
  if (hasStagedFiles) return null;

  const hasUploadedDocs = !!(backendSession?.uploadedDocs && backendSession.uploadedDocs.length > 0);
  const isButtonDisabled = running || uploadSuccess || (!hasStagedFiles && !hasUploadedDocs);
  const isAwaitingBackend = backendSession?.status === "AWAITING_USER_UPLOAD";

  // Contextual click handler
  const handleClick = () => {
    if (hasStagedFiles) {
      uploadStagedFiles();
    } else {
      startAnalysis();
    }
  };

  return (
    <div className="flex flex-col items-center pt-2">
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={handleClick}
        className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-brand px-7 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-50 disabled:shadow-none cursor-pointer"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading via REST API...</span>
          </>
        ) : uploadSuccess ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>Files Submitted successfully!</span>
          </>
        ) : running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="tabular-nums">{stages[stage] || "Analyzing..."}</span>
          </>
        ) : hasStagedFiles ? (
          <>
            <Sparkles className="h-4 w-4 text-brand-to animate-pulse" />
            <span>{isAwaitingBackend ? "Submit Supplementary Documents" : "Upload & Analyze Compliance Files"}</span>
          </>
        ) : (
          <>
            <Play className="h-4 w-4 fill-white" />
            <span>{t("analyze.cta")}</span>
          </>
        )}
      </button>
      <p className="mt-3 text-[11px] text-muted-foreground text-center">
        {t("analyze.note")}
      </p>
    </div>
  );
}
