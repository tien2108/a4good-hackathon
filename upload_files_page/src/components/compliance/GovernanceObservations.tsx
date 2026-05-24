import { Eye, ScrollText, UserCog, Check, AlertCircle } from "lucide-react";
import { Tag } from "./Tag";
import { useI18n } from "@/lib/i18n";
import { useBackendData } from "@/lib/backend-data";
import { CitationTooltip } from "./DecisionTreeAssessment";

type Item = { textKey: string; tag: "fact" | "interpretation" };
const groups: { icon: typeof Eye; titleKey: string; items: Item[] }[] = [
  {
    icon: Eye,
    titleKey: "sec2.g1.title",
    items: [
      { textKey: "sec2.g1.i1", tag: "interpretation" },
      { textKey: "sec2.g1.i2", tag: "fact" },
      { textKey: "sec2.g1.i3", tag: "interpretation" },
    ],
  },
  {
    icon: ScrollText,
    titleKey: "sec2.g2.title",
    items: [
      { textKey: "sec2.g2.i1", tag: "fact" },
      { textKey: "sec2.g2.i2", tag: "interpretation" },
      { textKey: "sec2.g2.i3", tag: "interpretation" },
      { textKey: "sec2.g2.i4", tag: "fact" },
    ],
  },
  {
    icon: UserCog,
    titleKey: "sec2.g3.title",
    items: [
      { textKey: "sec2.g3.i1", tag: "interpretation" },
      { textKey: "sec2.g3.i2", tag: "fact" },
      { textKey: "sec2.g3.i3", tag: "interpretation" },
    ],
  },
];

export function GovernanceObservations() {
  const { t } = useI18n();
  const { session } = useBackendData();
  const isOutOfScope = 
    session?.riskClassification?.toLowerCase().includes("out of scope") ||
    session?.riskClassification?.toLowerCase().includes("out-of-scope") ||
    session?.riskClassification?.toLowerCase().includes("exempt") ||
    session?.riskClassification?.toLowerCase().includes("article 2") ||
    session?.riskClassification?.toLowerCase().includes("article 6.3");

  if (isOutOfScope) {
    return (
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 px-7 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Section 02 — Governance Observations
            </p>
            <h2 className="mt-1 text-2xl text-foreground">
              Deduced Governance Observations
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Tag variant="neutral">Judge of Governance</Tag>
            <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-500/25 tracking-wide uppercase">
              ● Deactivated (Exempt)
            </span>
          </div>
        </header>

        <div className="px-7 py-8 text-center max-w-xl mx-auto">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 mb-4">
            <Check className="h-5 w-5 text-zinc-500" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Governance Audit Not Required
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Because this application has been classified as <strong className="text-foreground font-semibold">Out of Scope or Exempt</strong> from the EU AI Act, the mandated governance parameters (Articles 9–15) do not apply. The Judge of Governance agent has been safely deactivated to prevent redundant processing.
          </p>
        </div>
      </section>
    );
  }

  if (session?.governanceData) {
    const gov = session.governanceData;

    // Define the dynamic groups based on the 8 required fields
    const dynamicGroups = [
      {
        icon: Eye,
        title: "Human Oversight & System Monitoring",
        items: [
          { key: "humanOversight", label: "Human Oversight Framework" },
          { key: "monitoring", label: "Continuous Monitoring & Drift" },
          { key: "logging", label: "Audit Logging Mechanisms" },
        ]
      },
      {
        icon: ScrollText,
        title: "Technical Documentation & Transparency",
        items: [
          { key: "documentation", label: "Lifecycle Logging & Documentation" },
          { key: "transparency", label: "System Transparency & Disclosures" },
        ]
      },
      {
        icon: UserCog,
        title: "Accountability & Operational Role Clarity",
        items: [
          { key: "riskManagement", label: "Risk Management Systems" },
          { key: "accountability", label: "Organizational Accountability" },
          { key: "roleClarity", label: "Operational Role Clarity" },
        ]
      }
    ];

    return (
      <section className="rounded-lg border border-hairline bg-card">
        <header className="flex items-center justify-between gap-4 border-b border-hairline px-7 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Section 02 — Governance Observations
            </p>
            <h2 className="mt-1 text-2xl text-foreground">
              Deduced Governance Observations
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Tag variant="neutral">Judge of Governance</Tag>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/25 tracking-wide uppercase">
              ● Verda Llama-3.1 Active
            </span>
          </div>
        </header>

        <div className="divide-y divide-hairline">
          {dynamicGroups.map((group, gIdx) => {
            const Icon = group.icon;
            return (
              <div key={gIdx} className="px-7 py-7">
                <div className="mb-5 flex items-center gap-3">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h3 className="text-base font-medium tracking-tight text-foreground">
                    {group.title}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {group.items.map((item) => {
                    const value = gov[item.key];
                    let displayText = value || "";
                    let isRerun = false;
                    let isUploaded = false;

                    if (value) {
                      if (value.startsWith("RERUN_SUCCESS:")) {
                        isRerun = true;
                        displayText = value.replace("RERUN_SUCCESS:", "").trim();
                      } else if (value.startsWith("USER_UPLOADED_RESOLVED:")) {
                        isUploaded = true;
                        displayText = value.replace("USER_UPLOADED_RESOLVED:", "").trim();
                      }
                    }

                    return (
                      <li key={item.key} className="flex items-start gap-3">
                        {value ? (
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-fact/30 bg-fact-soft/30">
                            <Check className="h-3 w-3 text-fact" strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-gap/40 bg-gap-soft/30 animate-pulse">
                            <AlertCircle className="h-3 w-3 text-gap" strokeWidth={2.5} />
                          </span>
                        )}
                        <div className="flex-1">
                          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {value ? renderTextWithHtmlTags(displayText) : `No notes, procedural evidence, or safety strategies were provided in the proposal for this mandated area. This creates a high liability gap under the EU AI Act.`}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {value ? (
                              isRerun ? (
                                <Tag variant="fact">Rerun NLP Extraction</Tag>
                              ) : isUploaded ? (
                                <Tag variant="fact">Resolved Upload</Tag>
                              ) : (
                                <Tag variant="interpretation">Governance Observation</Tag>
                              )
                            ) : (
                              <Tag variant="gap">Critical Gap</Tag>
                            )}
                            <Tag variant="neutral">System-Interpreted Reasoning</Tag>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (session && session.status !== "IDLE") {
    const isWaiting = session.status === "PARSING" || session.status === "CLASSIFYING";
    const statusMsg = isWaiting
      ? "⏳ Waiting for preceding regulatory risk classification..."
      : "✨ Judge of Governance Agent: Analyzing proposal against 8 mandated EU AI Act compliance vectors...";

    return (
      <section className="rounded-lg border border-hairline bg-card animate-pulse">
        <header className="flex items-center justify-between gap-4 border-b border-hairline px-7 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Section 02 — Governance Observations
            </p>
            <h2 className="mt-1 text-2xl text-foreground">
              Deduced Governance Observations
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Tag variant="neutral">Judge of Governance</Tag>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/25 animate-pulse tracking-wide uppercase">
              ● Querying Verda Llama...
            </span>
          </div>
        </header>

        <div className="px-7 py-6">
          <p className="text-xs font-semibold text-primary/70 tracking-wider uppercase mb-5">
            {statusMsg}
          </p>

          <div className="space-y-6 divide-y divide-hairline">
            {[1, 2].map((group) => (
              <div key={group} className="pt-6 first:pt-0">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-muted/30" />
                  <div className="h-4 w-48 rounded bg-muted/20" />
                </div>
                <div className="space-y-4 pl-7">
                  {[1, 2].map((item) => (
                    <div key={item} className="flex gap-3">
                      <div className="h-5 w-5 shrink-0 rounded bg-muted/20" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-24 rounded bg-muted/30" />
                        <div className="h-3.5 w-full rounded bg-muted/15" />
                        <div className="h-3.5 w-5/6 rounded bg-muted/15" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback static view
  return (
    <section className="rounded-lg border border-hairline bg-card">
      <header className="flex items-center justify-between gap-4 border-b border-hairline px-7 py-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t("sec2.kicker")}
          </p>
          <h2 className="mt-1 text-2xl text-foreground">
            {t("sec2.title")}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Tag variant="neutral">{t("sec2.agent")}</Tag>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30 px-2 py-0.5 rounded border border-slate-500/25 tracking-wide uppercase">
            ● Demo Static Mode
          </span>
        </div>
      </header>

      <div className="divide-y divide-hairline">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.titleKey} className="px-7 py-7">
              <div className="mb-5 flex items-center gap-3">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h3 className="text-base font-medium tracking-tight text-foreground">
                  {t(group.titleKey)}
                </h3>
              </div>
              <ul className="space-y-3.5">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-fact/30 bg-fact-soft/30">
                      <Check className="h-3 w-3 text-fact" strokeWidth={2.5} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {t(item.textKey)}
                      </p>
                      <div className="mt-1.5">
                        <Tag variant={item.tag}>
                          {item.tag === "fact" ? t("tag.fact") : t("tag.interpretation")}
                        </Tag>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Safely parses and renders text containing HTML <i> tags as native JSX elements
function renderTextWithHtmlTags(text: string) {
  if (!text) return "";
  const regex = /(<i>.*?<\/i>)/g;
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    if (part.startsWith("<i>") && part.endsWith("</i>")) {
      const articleText = part.slice(3, -4);
      return (
        <CitationTooltip key={idx} text={articleText} className="italic text-foreground font-sans not-italic font-normal [font-style:italic] cursor-help underline decoration-dotted decoration-1">
          <i>{articleText}</i>
        </CitationTooltip>
      );
    }
    return part;
  });
}

