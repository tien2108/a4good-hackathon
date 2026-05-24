import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/compliance/SiteHeader";
import { IntroSection } from "@/components/compliance/IntroSection";
import { Workspace } from "@/components/compliance/WorkspaceGrid";
import { DisclaimerFooter } from "@/components/compliance/DisclaimerFooter";
import { AppProvider, useApp } from "@/components/compliance/AppContext";

// Import migrated dashboard components
import { UseCaseSummary } from "@/components/compliance/UseCaseSummary";
import { DecisionTreeAssessment } from "@/components/compliance/DecisionTreeAssessment";
import { GovernanceObservations } from "@/components/compliance/GovernanceObservations";
import { RiskCaveats } from "@/components/compliance/RiskCaveats";
import { ExportDock } from "@/components/compliance/ExportDock";
import { AdvisoryFootnote } from "@/components/compliance/AdvisoryFootnote";
import { FileDropzone } from "@/components/compliance/FileDropzone";
import { LandingChatbot } from "@/components/compliance/LandingChatbot";

import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EU AI Act Compliance Checker · Regulatory Copilot" },
      {
        name: "description",
        content:
          "Transform complex EU AI Act documentation into grounded, auditable compliance insights with an autonomous multi-agent review pipeline.",
      },
      { property: "og:title", content: "EU AI Act Compliance Checker" },
      {
        property: "og:description",
        content:
          "Upload implementation files and receive structured risk classifications, governance checklists, and source-grounded citations.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: IndexPageWrapper,
});

function IndexPageWrapper() {
  return (
    <AppProvider>
      <Index />
    </AppProvider>
  );
}

function Index() {
  const { status, backendSession, isViewingHistory, historicalRunName, restoreLiveSession } = useApp();
  
  // Dashboard displays when analysis is running, complete, or awaiting supplementary uploads
  const showDashboard =
    status === "running" ||
    status === "complete" ||
    backendSession?.status === "AWAITING_USER_UPLOAD";

  useEffect(() => {
    if (backendSession?.status === "AWAITING_USER_UPLOAD") {
      const timer = setTimeout(() => {
        const element = document.getElementById("supplementary-upload-alert");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [backendSession?.status]);

  if (showDashboard) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        {isViewingHistory && (
          <div className="bg-gradient-to-r from-amber-600/90 via-amber-500/95 to-amber-600/90 py-2.5 px-4 text-white text-center shadow-md border-b border-amber-500/30 backdrop-blur animate-fade-in flex items-center justify-center gap-3">
            <span className="grid h-5 w-5 place-items-center rounded bg-white/20 text-white animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs sm:text-sm font-medium tracking-tight">
              Viewing Historical Compliance Archive: <strong className="font-bold underline">{historicalRunName}</strong> (Read-Only)
            </span>
            <button
              onClick={restoreLiveSession}
              className="ml-2 inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[10px] font-bold text-amber-600 hover:bg-amber-50 hover:scale-[1.03] transition-all shadow-sm active:scale-[0.98]"
            >
              <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" />
              <span>Restore Live Session</span>
            </button>
          </div>
        )}
        <DashboardControlBar />
        
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 pb-40 sm:px-6 lg:px-8">
          {backendSession?.status === "AWAITING_USER_UPLOAD" && (
            <div id="supplementary-upload-alert" className="rounded-3xl border border-dashed border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-6 shadow-glow backdrop-blur-md animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Supplementary Compliance Documents Required
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The EU AI Act Missing Information Agent has identified gaps in the evaluation data. Please drag & drop or browse requested sheets/evidence using the dropzone below to resolve, or click "Skip Upload" inside the dropzone controller to proceed.
                  </p>
                  <div className="mt-4 max-w-2xl">
                    <FileDropzone />
                  </div>
                </div>
              </div>
            </div>
          )}

          <LandingChatbot />
          <UseCaseSummary />
          <DecisionTreeAssessment />
          <div className="grid gap-6 lg:grid-cols-[65fr_35fr]">
            <GovernanceObservations />
            <RiskCaveats />
          </div>
        </main>
        
        <ExportDock />
        <AdvisoryFootnote />
      </div>
    );
  }

  // Otherwise, render landing/ingestion pipeline
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <IntroSection />
        <Workspace />
      </main>
      <DisclaimerFooter />
    </div>
  );
}

function DashboardControlBar() {
  const { backendSession, status, currentRisk, t } = useApp();
  const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Issue a POST request to start a fresh random session
      const newSessionId = "session_" + Math.random().toString(36).substring(2, 11);
      const res = await fetch(`${BACKEND_URL}/api/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: newSessionId, scenario: "" }),
      });
      if (res.ok) {
        // Simple reload to reset all react context states cleanly
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to reset session:", err);
    } finally {
      setIsResetting(false);
    }
  };

  const getStatusText = () => {
    if (backendSession?.status === "AWAITING_USER_UPLOAD") {
      return "Awaiting Supplementary Upload";
    }
    if (status === "running") {
      return `Processing... (${backendSession?.status || "Analyzing"})`;
    }
    return "Analysis Complete";
  };

  return (
    <div className="sticky top-0 z-40 border-b border-border/80 bg-background/80 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all disabled:opacity-50 cursor-pointer"
          >
            {isResetting ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowLeft className="h-3.5 w-3.5" />
            )}
            Clear Session & Run New Audit
          </button>
          
          <div className="hidden h-4 w-px bg-border sm:block" />
          
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <span className="text-muted-foreground font-sans">Pipeline Status:</span>
            <span className={`inline-flex items-center gap-1.5 font-semibold font-heading uppercase tracking-wider ${status === "running" ? "text-[color:var(--brand-via)] animate-pulse" : "text-[color:var(--emerald)]"}`}>
              {status !== "running" && backendSession?.status === "COMPLETED_SUCCESS" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--emerald)]" />
              )}
              {getStatusText()}
            </span>
          </div>
        </div>

        {currentRisk && (
          <div className={`flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-sm transition-all duration-300 ${
            currentRisk === "unacceptable"
              ? "border-red-500/30 bg-red-500/10 text-red-500"
              : currentRisk === "high"
                ? "border-orange-500/30 bg-orange-500/10 text-orange-500"
                : currentRisk === "limited"
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                  : currentRisk === "minimal"
                    ? "border-green-500/30 bg-green-500/10 text-green-500"
                    : "border-white/20 bg-white/5 text-white"
          }`}>
            <span className="opacity-85 font-sans">Risk Tier:</span>
            <span className="font-heading uppercase tracking-wider">
              {t(`tier.${currentRisk}`)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

