import { FileSearch } from "lucide-react";
import { Tag } from "./Tag";
import { useI18n } from "@/lib/i18n";
import { useBackendData } from "@/lib/backend-data";

export function UseCaseSummary() {
  const { t } = useI18n();
  const { session } = useBackendData();

  if (session?.proposalFacts) {
    const facts = session.proposalFacts;

    // Build humanized description dynamically based on extracted parameters
    const highlight = facts.purpose || "AI-powered application";
    const before = "The assessed system is an";
    const after = `designed to operate within the ${facts.sector || "specified sector"}, utilizing ${facts.inputData || "ingested records"} to generate ${facts.outputs || "intelligent compliance actions"} under the supervision of ${facts.users || "licensed operators"}.`;

    return (
      <section className="rounded-lg border border-hairline bg-card p-7 md:p-9">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSearch className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Section 01 — Humanized Use-Case Summary
            </h2>
          </div>
          <Tag variant="neutral">Input Parser Agent</Tag>
        </div>

        <p className="font-heading text-2xl leading-relaxed text-foreground md:text-[28px] md:leading-[1.5]">
          {before}{" "}
          <span className="bg-interpretation-soft/30 px-1 text-interpretation">
            {highlight}
          </span>{" "}
          {after}
        </p>

        <div className="mt-6 grid gap-5 border-t border-hairline pt-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-3">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
              Core Purpose
            </p>
            {facts.purpose}
          </div>
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
              Target End-Users
            </p>
            {facts.users}
          </div>
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
              Deployment Framework
            </p>
            {facts.deploymentContext || "Standalone / SaaS integration"}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {facts.sector && <Tag variant="fact">Uploaded-Doc Fact · Sector: {facts.sector}</Tag>}
          {facts.inputData && <Tag variant="fact">Uploaded-Doc Fact · Ingests: {facts.inputData.slice(0, 50)}...</Tag>}
          {facts.affectedPersons && <Tag variant="fact">Uploaded-Doc Fact · Affected: {facts.affectedPersons}</Tag>}
          {facts.automationLevel && <Tag variant="interpretation">Interpretation · Autonomy: {facts.automationLevel}</Tag>}
          {facts.humanOversight && <Tag variant="interpretation">Interpretation · Oversight: {facts.humanOversight.slice(0, 45)}...</Tag>}
        </div>
      </section>
    );
  }

  if (session && session.status !== "IDLE") {
    return (
      <section className="rounded-lg border border-hairline bg-card p-7 md:p-9 animate-pulse">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSearch className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Section 01 — Humanized Use-Case Summary
            </h2>
          </div>
          <Tag variant="neutral">Input Parser Agent</Tag>
        </div>

        <div className="space-y-3">
          <div className="h-7 w-5/6 rounded bg-muted/30" />
          <div className="h-7 w-3/4 rounded bg-muted/20" />
        </div>

        <p className="mt-4 text-xs font-semibold text-primary/70 tracking-wider uppercase">
          {session.status === "PARSING" 
            ? "✨ Input Parser Agent: Actively reading proposal document & extracting facts..." 
            : "Parser analysis complete. Compiling layout..."}
        </p>

        <div className="mt-8 grid gap-5 border-t border-hairline pt-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-2.5 w-24 rounded bg-muted/30" />
              <div className="h-4 w-full rounded bg-muted/15" />
              <div className="h-4 w-2/3 rounded bg-muted/15" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-hairline bg-card p-7 md:p-9">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSearch className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t("sec1.kicker")}
          </h2>
        </div>
        <Tag variant="neutral">{t("sec1.agent")}</Tag>
      </div>

      <p className="font-heading text-2xl leading-relaxed text-foreground md:text-[28px] md:leading-[1.5]">
        {t("sec1.body.before")}{" "}
        <span className="bg-interpretation-soft/30 px-1 text-interpretation">
          {t("sec1.body.highlight")}
        </span>{" "}
        {t("sec1.body.after")}
      </p>

      <div className="mt-6 grid gap-5 border-t border-hairline pt-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-3">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
            {t("sec1.core.title")}
          </p>
          {t("sec1.core.body")}
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
            {t("sec1.users.title")}
          </p>
          {t("sec1.users.body")}
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
            {t("sec1.deploy.title")}
          </p>
          {t("sec1.deploy.body")}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Tag variant="fact">{t("sec1.tag.sector")}</Tag>
        <Tag variant="fact">{t("sec1.tag.eu")}</Tag>
        <Tag variant="interpretation">{t("sec1.tag.annex")}</Tag>
        <Tag variant="gap">{t("sec1.tag.autonomy")}</Tag>
      </div>
    </section>
  );
}
