import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/compliance/SiteHeader";
import { IntroSection } from "@/components/compliance/IntroSection";
import { Workspace } from "@/components/compliance/WorkspaceGrid";
import { AnalysisReport } from "@/components/compliance/AnalysisReport";
import { DisclaimerFooter } from "@/components/compliance/DisclaimerFooter";
import { AppProvider, useApp } from "@/components/compliance/AppContext";

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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <IntroSection />
          <ReportStrip />
          <Workspace />
        </main>
        <DisclaimerFooter />
      </div>
    </AppProvider>
  );
}

function ReportStrip() {
  const { status } = useApp();
  if (status === "idle") return null;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <AnalysisReport />
    </div>
  );
}
