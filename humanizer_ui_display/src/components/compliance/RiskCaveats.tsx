import { AlertTriangle, CircleHelp } from "lucide-react";
import { Tag } from "./Tag";
import { useI18n } from "@/lib/i18n";

const uncertaintyKeys = ["sec3.u1", "sec3.u2", "sec3.u3", "sec3.u4"];
const actionKeys = ["sec3.a1", "sec3.a2", "sec3.a3", "sec3.a4", "sec3.a5"];

export function RiskCaveats() {
  const { t } = useI18n();
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
          {t("sec3.subtitle")}
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
                className="rounded border border-gap/20 bg-card/40 px-3 py-2.5 text-sm leading-relaxed text-foreground/85"
              >
                {t(u)}
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
          <ul className="space-y-2.5">
            {actionKeys.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gap" />
                <span>{t(a)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
