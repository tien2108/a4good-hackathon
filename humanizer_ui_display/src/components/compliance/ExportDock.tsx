import { useState } from "react";
import { FileText, Presentation, Send, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ExportDock() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!EMAIL_RE.test(email)) {
      toast.error(t("dock.toast.invalid"));
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setEmail("");
    toast.success(t("dock.toast.success"));
  };

  return (
    <div className="sticky bottom-10 z-40 mx-auto max-w-7xl px-6">
      <div className="rounded-xl border border-hairline bg-surface-elevated/95 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t("dock.kicker")}
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toast(t("dock.toast.pdf"))}
              className="inline-flex items-center gap-2 rounded-md border border-hairline bg-card px-3.5 py-2.5 text-sm text-foreground transition hover:border-primary/40 hover:bg-card/80"
            >
              <FileText className="h-4 w-4" strokeWidth={1.5} />
              {t("dock.pdf")}
            </button>
            <button
              onClick={() => toast(t("dock.toast.ppt"))}
              className="inline-flex items-center gap-2 rounded-md border border-hairline bg-card px-3.5 py-2.5 text-sm text-foreground transition hover:border-primary/40 hover:bg-card/80"
            >
              <Presentation className="h-4 w-4" strokeWidth={1.5} />
              {t("dock.ppt")}
            </button>
          </div>

          <div className="hidden h-9 w-px bg-hairline lg:block" />

          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
                placeholder={t("dock.email.placeholder")}
                className="w-full rounded-md border border-hairline bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-60"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("dock.sending")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                  {t("dock.send")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
