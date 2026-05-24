import { useState } from "react";
import { AlertTriangle, CircleHelp, X, ShieldAlert, Check } from "lucide-react";
import { Tag } from "./Tag";
import { useI18n } from "@/lib/i18n";
import { useBackendData } from "@/lib/backend-data";

const uncertaintyKeys = ["sec3.u1", "sec3.u2", "sec3.u3", "sec3.u4"];
const actionKeys = ["sec3.a1", "sec3.a2", "sec3.a3", "sec3.a4", "sec3.a5"];

interface DetailState {
  title: string;
  content: string;
  type: "assumption" | "gap" | "uncertainty" | "action";
}

export function RiskCaveats() {
  const { t } = useI18n();
  const { session } = useBackendData();
  const [activeDetail, setActiveDetail] = useState<DetailState | null>(null);

  const isOutOfScope = 
    session?.riskClassification?.toLowerCase().includes("out of scope") ||
    session?.riskClassification?.toLowerCase().includes("out-of-scope") ||
    session?.riskClassification?.toLowerCase().includes("exempt") ||
    session?.riskClassification?.toLowerCase().includes("article 2") ||
    session?.riskClassification?.toLowerCase().includes("article 6.3");

  if (isOutOfScope) {
    return (
      <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
        <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            <p className="text-[11px] font-medium uppercase tracking-[0.22em]">
              Section 03 — Risk & Confidence Boundaries
            </p>
          </div>
          <h2 className="mt-2 text-xl text-foreground">
            Assumptions & Assessment Gaps
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Auditing pre-market compliance liabilities, legal risks, and critical gaps identified by the pipeline.
          </p>
        </header>

        <div className="px-6 py-8 text-center max-w-sm mx-auto">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 mb-4">
            <Check className="h-5 w-5 text-zinc-500" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No Active Gaps or Assumptions
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            As an out-of-scope or exempt system, there are no active compliance risk gaps or structural assumptions to audit under the EU AI Act framework.
          </p>
        </div>
      </section>
    );
  }

  // Dynamic Completed State View
  if (session && (session.status.startsWith("COMPLETED") || session.assumptions?.length > 0 || session.gaps?.length > 0)) {
    const assumptions = session?.assumptions || [];
    const gaps = session?.gaps || [];

    return (
      <section className="rounded-lg border border-gap/40 bg-gap-soft/15 shadow-[0_0_60px_-30px_oklch(0.82_0.15_80/0.6)]">
        <header className="border-b border-gap/30 px-6 py-5">
          <div className="flex items-center gap-2 text-gap">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            <p className="text-[11px] font-medium uppercase tracking-[0.22em]">
              Section 03 — Risk & Confidence Boundaries
            </p>
          </div>
          <h2 className="mt-2 text-xl text-foreground">
            Assumptions & Assessment Gaps
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Auditing the pre-market compliance liabilities, legal risks, and critical gaps identified by the pipeline. Click any item to explore full details.
          </p>
        </header>

        <div className="space-y-6 px-6 py-6">
          {/* Possible Assumptions Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/80">
                Possible Assumptions Made
              </h3>
              <Tag variant="gap">{assumptions.length} Uncertainty Flags</Tag>
            </div>
            <ul className="space-y-3">
              {assumptions.length > 0 ? (
                assumptions.map((ass, i) => {
                  const cleanAss = ass.replace("[ASSUMPTION]", "").trim();
                  const isLong = cleanAss.length > 100;
                  const displayAss = isLong ? `${cleanAss.slice(0, 100)}...` : cleanAss;

                  return (
                    <li
                      key={i}
                      onClick={() => setActiveDetail({
                        title: "Assumed Compliance Setup",
                        content: cleanAss,
                        type: "assumption"
                      })}
                      className="rounded-xl border border-gap/20 bg-card/45 px-4 py-3 text-sm leading-relaxed text-foreground/85 transition-all hover:border-gap/50 hover:bg-muted/10 cursor-pointer hover:scale-[1.005] active:scale-[0.995] duration-200 select-none shadow-sm flex items-center justify-between gap-4"
                    >
                      <span className="flex-1 text-left">{displayAss}</span>
                      <span className="shrink-0 text-[10px] text-gap bg-gap/10 px-2 py-0.5 rounded-full font-bold tracking-tight uppercase">
                        Details
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="rounded border border-fact/20 bg-card/40 px-3 py-2.5 text-xs text-muted-foreground italic text-center">
                  No compliance assumptions were identified by the agent.
                </li>
              )}
            </ul>
          </div>

          {/* Assessment Gaps Section */}
          <div className="border-t border-gap/20 pt-5">
            <div className="mb-3 flex items-center gap-2">
              <CircleHelp className="h-3.5 w-3.5 text-gap" strokeWidth={1.75} />
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/80">
                Identified Assessment Gaps
              </h3>
            </div>
            <ul className="space-y-3">
              {gaps.length > 0 ? (
                gaps.map((gap, i) => {
                  const cleanGap = gap.replace("[GAP IN ASSESSMENT]", "").trim();
                  const isLong = cleanGap.length > 100;
                  const displayGap = isLong ? `${cleanGap.slice(0, 100)}...` : cleanGap;

                  return (
                    <li
                      key={i}
                      onClick={() => setActiveDetail({
                        title: "Critical Assessment Gap",
                        content: cleanGap,
                        type: "gap"
                      })}
                      className="rounded-xl border border-gap/20 bg-card/45 px-4 py-3 text-sm leading-relaxed text-foreground/85 transition-all hover:border-gap/50 hover:bg-muted/10 cursor-pointer hover:scale-[1.005] active:scale-[0.995] duration-200 select-none shadow-sm flex items-center justify-between gap-4"
                    >
                      <span className="flex-1 text-left">{displayGap}</span>
                      <span className="shrink-0 text-[10px] text-gap bg-gap/10 px-2 py-0.5 rounded-full font-bold tracking-tight uppercase">
                        Details
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="rounded border border-fact/20 bg-card/40 px-3 py-2.5 text-xs text-muted-foreground italic text-center">
                  🎉 No active compliance omissions or gaps detected. Perfect structural compliance achieved!
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Modal popup element */}
        {renderDetailModal(activeDetail, () => setActiveDetail(null))}
      </section>
    );
  }

  // Active Loading Pipeline View
  if (session && session.status !== "IDLE") {
    const isWaiting = session.status !== "CONVERGING" && session.status !== "CHECKING_MISSING_INFO" && session.status !== "AWAITING_USER_UPLOAD";
    const statusMsg = isWaiting
      ? "⏳ Waiting for governance compliance audit to finish..."
      : "✨ Prevention of Confidence Agent: Structuring high-standard AI expert questions & safety gaps...";

    return (
      <section className="rounded-lg border border-gap/30 bg-gap-soft/5 p-6 animate-pulse">
        <header className="border-b border-gap/20 pb-5">
          <div className="flex items-center gap-2 text-gap">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-[11px] font-medium uppercase tracking-[0.22em]">
              Section 03 — Risk & Confidence Boundaries
            </p>
          </div>
          <h2 className="mt-2 text-xl text-foreground">
            Assumptions & Assessment Gaps
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Auditing pre-market compliance liabilities, legal risks, and critical gaps identified by the pipeline.
          </p>
        </header>

        <div className="mt-6 space-y-6">
          <p className="text-xs font-semibold text-gap/85 tracking-wider uppercase">
            {statusMsg}
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-36 rounded bg-muted/30" />
              <div className="h-5 w-24 rounded-full bg-muted/20" />
            </div>
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full rounded border border-gap/10 bg-card/20" />
              ))}
            </div>
          </div>

          <div className="border-t border-gap/10 pt-5 space-y-4">
            <div className="h-3 w-40 rounded bg-muted/30" />
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full rounded border border-gap/10 bg-card/20" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback static / empty session view
  return (
    <section className="rounded-lg border border-gap/40 bg-gap-soft/15 shadow-[0_0_60px_-30px_oklch(0.82_0.15_80/0.6)]">
      <header className="border-b border-gap/30 px-6 py-5">
        <div className="flex items-center gap-2 text-gap">
          <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
          <p className="text-[11px] font-medium uppercase tracking-[0.22em]">
            {t("sec3.kicker")}
          </p>
        </div>
        <h2 className="mt-2 text-xl text-foreground">
          {t("sec3.title")}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t("sec3.subtitle")} Click any item to explore full details.
        </p>
      </header>

      <div className="space-y-6 px-6 py-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/80">
              {t("sec3.uncertainty.title")}
            </h3>
            <Tag variant="gap">{uncertaintyKeys.length} {t("sec3.uncertainty.open")}</Tag>
          </div>
          <ul className="space-y-3">
            {uncertaintyKeys.map((u, i) => (
              <li
                key={i}
                onClick={() => setActiveDetail({
                  title: "Assumed Compliance Setup",
                  content: t(u),
                  type: "uncertainty"
                })}
                className="rounded-xl border border-gap/20 bg-card/45 px-4 py-3 text-sm leading-relaxed text-foreground/85 transition-all hover:border-gap/50 hover:bg-muted/10 cursor-pointer hover:scale-[1.005] active:scale-[0.995] duration-200 select-none shadow-sm flex items-center justify-between gap-4"
              >
                <span className="flex-1 text-left">{t(u)}</span>
                <span className="shrink-0 text-[10px] text-gap bg-gap/10 px-2 py-0.5 rounded-full font-bold tracking-tight uppercase">
                  Details
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gap/20 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <CircleHelp className="h-3.5 w-3.5 text-gap" strokeWidth={1.75} />
            <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/80">
              {t("sec3.actions.title")}
            </h3>
          </div>
          <ul className="space-y-3">
            {actionKeys.map((a, i) => (
              <li
                key={i}
                onClick={() => setActiveDetail({
                  title: "Critical Assessment Gap",
                  content: t(a),
                  type: "action"
                })}
                className="rounded-xl border border-gap/20 bg-card/45 px-4 py-3 text-sm leading-relaxed text-foreground/85 transition-all hover:border-gap/50 hover:bg-muted/10 cursor-pointer hover:scale-[1.005] active:scale-[0.995] duration-200 select-none shadow-sm flex items-center justify-between gap-4"
              >
                <span className="flex-1 text-left">{t(a)}</span>
                <span className="shrink-0 text-[10px] text-gap bg-gap/10 px-2 py-0.5 rounded-full font-bold tracking-tight uppercase">
                  Details
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal popup element */}
      {renderDetailModal(activeDetail, () => setActiveDetail(null))}
    </section>
  );
}

// Separate wider glassmorphic popup helper centered on screen
function renderDetailModal(detail: DetailState | null, onClose: () => void) {
  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/40 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal container - sleek glassmorphic */}
      <article className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gap/50 bg-card/70 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-scale-up p-6 sm:p-8">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-24 -left-24 -z-10 h-48 w-48 rounded-full bg-gap/10 blur-2xl" />

        {/* Header */}
        <header className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gap/10">
              <AlertTriangle className="h-4.5 w-4.5 text-gap" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gap">
                {detail.title}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Regulatory Confidence & Risk Audit Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-border/60 bg-background/50 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Elaboration Content */}
        <div className="space-y-4 text-left select-text">
          <p className="text-sm leading-relaxed text-foreground/90 font-medium">
            {detail.content}
          </p>
          
          {/* Extra legal safety advisory context to feel extremely premium */}
          <div className="mt-4 flex gap-3 rounded-2xl border border-border/40 bg-muted/20 p-4">
            <ShieldAlert className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-foreground">Compliance Advisory</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This risk caveat was automatically synthesized by the regulatory auditor agent. Omissions, technological leaps, or technical limitations identified here can degrade overall certification accuracy. Review these assertions with your legal conformity representative.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-xl bg-gap/10 border border-gap/20 px-4 py-2 text-xs font-bold text-gap hover:bg-gap/20 transition-all cursor-pointer"
          >
            Dismiss Detail
          </button>
        </footer>
      </article>
    </div>
  );
}
