import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/compliance/DashboardHeader";
import { UseCaseSummary } from "@/components/compliance/UseCaseSummary";
import { GovernanceObservations } from "@/components/compliance/GovernanceObservations";
import { RiskCaveats } from "@/components/compliance/RiskCaveats";
import { ExportDock } from "@/components/compliance/ExportDock";
import { AdvisoryFootnote } from "@/components/compliance/AdvisoryFootnote";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compliance Report Dashboard — EU AI Act Review" },
      {
        name: "description",
        content:
          "Humanized output of a multi-agent EU AI Act compliance review pipeline: use-case summary, governance observations, and risk caveats.",
      },
      { property: "og:title", content: "Compliance Report Dashboard — EU AI Act Review" },
      {
        property: "og:description",
        content: "Multi-agent regulatory review output for AI systems under the EU AI Act.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 pb-40">
        <UseCaseSummary />
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
