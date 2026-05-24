import { useState } from "react";
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, Coins, Library, HelpCircle } from "lucide-react";
import { useApp } from "./AppContext";

type Tab = "risk" | "penalties";

const tiers = [
  { id: "unacceptable", color: "destructive", icon: AlertOctagon },
  { id: "high", color: "amber", icon: AlertTriangle },
  { id: "limited", color: "brand", icon: Info },
  { id: "minimal", color: "emerald", icon: CheckCircle2 },
  { id: "out_of_scope", color: "zinc", icon: HelpCircle },
] as const;

const colorClass = (c: (typeof tiers)[number]["color"]) =>
  ({
    destructive: "text-red-500 bg-red-500/10 ring-red-500/20",
    amber: "text-orange-500 bg-orange-500/10 ring-orange-500/20",
    brand: "text-yellow-500 bg-yellow-500/10 ring-yellow-500/20",
    emerald: "text-green-500 bg-green-500/10 ring-green-500/20",
    zinc: "text-zinc-100 bg-zinc-100/10 ring-zinc-100/20 dark:text-white dark:bg-white/10 dark:ring-white/20",
  })[c];

export function ReferenceSidebar() {
  const [tab, setTab] = useState<Tab>("risk");
  const { t } = useApp();

  return (
    <aside className="rounded-3xl border border-border bg-card/60 p-6 shadow-elegant backdrop-blur lg:p-7">
      <header className="mb-5 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-brand text-white">
          <Library className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {t("ref.title")}
        </h2>
      </header>

      <div className="inline-flex w-full rounded-xl border border-border bg-muted/60 p-1">
        {(
          [
            { id: "risk", label: t("ref.tab.risk"), icon: AlertTriangle },
            { id: "penalties", label: t("ref.tab.penalties"), icon: Coins },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              tab === id
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "risk" ? (
          <ul className="space-y-2.5">
            {tiers.map(({ id, color, icon: Icon }) => (
              <li
                key={id}
                className="group rounded-xl border border-border bg-background/60 p-3.5 transition-colors hover:border-[color:var(--brand-via)]/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`grid h-8 w-8 place-items-center rounded-lg ring-1 ring-inset ${colorClass(color)}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">{t(`tier.${id}`)}</h3>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${colorClass(color)}`}>
                    {t(`tier.${id}.chip`)}
                  </span>
                </div>
                <p className="mt-2 pl-[42px] text-xs leading-relaxed text-muted-foreground">
                  {t(`tier.${id}.ex`)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
              <div className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">{t("pen.prohibited.label")}</span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                €35M <span className="text-base font-medium text-muted-foreground">{t("pen.prohibited.suffix")}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{t("pen.prohibited.note")}</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[color:var(--amber)]/30 bg-[color:var(--amber)]/10 p-5">
              <div className="flex items-center gap-2 text-[color:var(--amber-foreground)]">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">{t("pen.high.label")}</span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                €15M <span className="text-base font-medium text-muted-foreground">{t("pen.high.suffix")}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{t("pen.high.note")}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-4 text-[11px] leading-relaxed text-muted-foreground">
              {t("pen.foot")}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
