import {
  ClipboardList,
  ListChecks,
  Gauge,
  ShieldCheck,
  HelpCircle,
  Quote,
  Info,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
} from "lucide-react";
import { useApp, type RiskTierId } from "./AppContext";

const sections = [
  { icon: ClipboardList, key: "useCase" },
  { icon: ListChecks, key: "ops" },
  { icon: Gauge, key: "risk" },
  { icon: ShieldCheck, key: "gov" },
  { icon: HelpCircle, key: "unc" },
  { icon: Quote, key: "cite" },
] as const;

const tierMeta: Record<
  RiskTierId,
  { color: string; ring: string; chipBg: string; icon: typeof Info }
> = {
  unacceptable: {
    color: "text-red-500",
    ring: "ring-red-500/30",
    chipBg: "bg-red-500/10",
    icon: AlertOctagon,
  },
  high: {
    color: "text-orange-500",
    ring: "ring-orange-500/30",
    chipBg: "bg-orange-500/10",
    icon: AlertTriangle,
  },
  limited: {
    color: "text-yellow-500",
    ring: "ring-yellow-500/30",
    chipBg: "bg-yellow-500/10",
    icon: Info,
  },
  minimal: {
    color: "text-green-500",
    ring: "ring-green-500/30",
    chipBg: "bg-green-500/10",
    icon: CheckCircle2,
  },
  out_of_scope: {
    color: "text-zinc-100 dark:text-white",
    ring: "ring-zinc-400/30",
    chipBg: "bg-zinc-100/10 dark:bg-white/10",
    icon: HelpCircle,
  },
};

export function AnalysisReport() {
  const { t, status, currentRisk, finalRisk } = useApp();
  const isIdle = status === "idle";
  const isRunning = status === "running";

  const tierKey = currentRisk ?? "limited";
  const meta = tierMeta[tierKey];
  const TierIcon = meta.icon;

  return (
    <section id="report" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-elegant backdrop-blur lg:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-brand text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {t("report.title")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t("report.subtitle")}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${
              isIdle
                ? "border-border bg-background text-muted-foreground"
                : isRunning
                  ? "border-[color:var(--brand-via)]/30 bg-[color:var(--brand-via)]/10 text-[color:var(--brand-via)]"
                  : "border-[color:var(--emerald)]/30 bg-[color:var(--emerald)]/10 text-[color:var(--emerald)]"
            }`}
          >
            {isIdle ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                {t("report.status.awaiting")}
              </>
            ) : isRunning ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("report.status.running")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                {t("report.status.complete")}
              </>
            )}
          </span>
        </header>

        {isIdle ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-background/60 px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand/10 ring-1 ring-inset ring-[color:var(--brand-via)]/25">
              <Info className="h-6 w-6 text-[color:var(--brand-via)]" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              {t("report.empty.title")}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t("report.empty.body")}
            </p>
          </div>
        ) : (
          <div
            className={`mt-6 rounded-2xl border bg-background/60 p-5 ring-1 ring-inset ${meta.ring} transition-all`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl ${meta.chipBg} ${meta.color} ring-1 ring-inset ${meta.ring}`}
                >
                  <TierIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("report.risk.preliminary")}
                  </p>
                  <p
                    key={tierKey + (finalRisk ? "-final" : "-loop")}
                    className={`mt-0.5 text-xl font-semibold tracking-tight text-foreground ${
                      isRunning ? "animate-pulse" : ""
                    }`}
                  >
                    {t(`tier.${tierKey}`)}
                  </p>
                </div>
              </div>
              <span
                className={`hidden rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ring-inset sm:inline-block ${meta.chipBg} ${meta.color} ${meta.ring}`}
              >
                {t(`tier.${tierKey}.chip`)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {finalRisk ? t("report.risk.settled") : t("report.risk.exploring")}
            </p>
          </div>
        )}

        <div className="mt-10">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("report.modules")}
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map(({ icon: Icon, key }, idx) => (
              <article
                key={key}
                className="relative overflow-hidden rounded-2xl border border-border bg-background/40 p-5 opacity-90 transition-opacity hover:opacity-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground ring-1 ring-inset ring-border">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">
                      {t(`report.section.${key}`)}
                    </h4>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {t(`report.section.${key}.desc`)}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-5/6 rounded-full bg-muted" />
                  <div className="h-2 w-4/6 rounded-full bg-muted/80" />
                  <div className="h-2 w-3/6 rounded-full bg-muted/60" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
