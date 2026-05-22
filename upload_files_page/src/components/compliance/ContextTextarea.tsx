import { MessageSquareText } from "lucide-react";
import { useApp } from "./AppContext";

export function ContextTextarea() {
  const { t } = useApp();
  return (
    <div>
      <label htmlFor="context" className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquareText className="h-4 w-4 text-[color:var(--brand-via)]" />
        {t("context.label")}
      </label>
      <textarea
        id="context"
        rows={5}
        placeholder={t("context.placeholder")}
        className="mt-2 w-full resize-y rounded-xl border border-input bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-all focus:border-[color:var(--brand-via)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-via)]/15"
      />
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {t("context.hint")}
      </p>
    </div>
  );
}
