import { Loader2, Play } from "lucide-react";
import { useApp } from "./AppContext";

export function AnalyzeButton() {
  const { status, stage, startAnalysis, t } = useApp();
  const running = status === "running";
  const stages = [t("analyze.stage.1"), t("analyze.stage.2"), t("analyze.stage.3")];

  return (
    <div className="flex flex-col items-center pt-2">
      <button
        type="button"
        disabled={running}
        onClick={startAnalysis}
        className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-brand px-7 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-90"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="tabular-nums">{stages[stage]}</span>
          </>
        ) : (
          <>
            <Play className="h-4 w-4 fill-white" />
            {t("analyze.cta")}
          </>
        )}
      </button>
      <p className="mt-3 text-[11px] text-muted-foreground">{t("analyze.note")}</p>
    </div>
  );
}
