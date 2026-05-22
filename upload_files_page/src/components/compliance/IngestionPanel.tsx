import { FileDropzone } from "./FileDropzone";
import { ContextTextarea } from "./ContextTextarea";
import { AnalyzeButton } from "./AnalyzeButton";
import { Inbox } from "lucide-react";
import { useApp } from "./AppContext";

export function IngestionPanel({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();
  return (
    <section className={`rounded-3xl border border-border bg-card/60 shadow-elegant backdrop-blur ${compact ? "p-5" : "p-6 lg:p-8"}`}>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-brand text-white">
              <Inbox className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {t("ingest.title")}
            </h2>
          </div>
          {!compact && (
            <p className="mt-1 text-sm text-muted-foreground">{t("ingest.subtitle")}</p>
          )}
        </div>
        <span className="hidden rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline-block">
          {t("ingest.step")}
        </span>
      </header>

      <div className={compact ? "space-y-4" : "space-y-6"}>
        <FileDropzone />
        {!compact && <ContextTextarea />}
        <AnalyzeButton />
      </div>
    </section>
  );
}
