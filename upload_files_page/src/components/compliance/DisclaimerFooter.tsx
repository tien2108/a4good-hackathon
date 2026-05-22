import { Scale } from "lucide-react";
import { useApp } from "./AppContext";

export function DisclaimerFooter() {
  const { t } = useApp();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--amber)]/30 bg-[color:var(--amber)]/10 p-4">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--amber)]/25 text-[color:var(--amber-foreground)]">
            <Scale className="h-4 w-4" />
          </span>
          <p className="text-[12.5px] leading-relaxed text-foreground/80">
            <span className="font-semibold text-foreground">{t("disclaimer.label")}</span>{" "}
            {t("disclaimer.body")}
          </p>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} TBD Product · {t("footer.note")}
        </p>
      </div>
    </footer>
  );
}
