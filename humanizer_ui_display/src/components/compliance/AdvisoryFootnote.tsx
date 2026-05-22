import { Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AdvisoryFootnote() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-hairline bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-6 py-3.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-medium uppercase tracking-[0.18em] text-foreground/70">
            {t("footer.label")}
          </span>{" "}
          {t("footer.text")}
        </p>
      </div>
    </footer>
  );
}