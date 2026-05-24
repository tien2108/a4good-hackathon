import { useEffect, useState } from "react";
import { ShieldCheck, CircleDot, Sun, Moon, Languages } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useBackendData } from "@/lib/backend-data";

const LOCALES: Record<Lang, string> = { EN: "en-GB", FI: "fi-FI", SV: "sv-SE" };
const LANGS: Lang[] = ["FI", "SV", "EN"];

export function DashboardHeader() {
  const { lang, setLang, t } = useI18n();
  const { theme, toggle } = useTheme();
  const { session, hasBackendData } = useBackendData();
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString(LOCALES[lang], {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
  }, [lang]);

  const productTitle = session?.proposalFacts?.purpose
    ? session.proposalFacts.purpose.charAt(0).toUpperCase() + session.proposalFacts.purpose.slice(1)
    : (session && session.status !== "IDLE" ? "Active Compliance Scan..." : t("header.product"));

  const statusLabel = session?.humanizedSummary?.statusLabel
    ? session.humanizedSummary.statusLabel
    : (session && session.status !== "IDLE" ? `Audit Pipeline: ${session.status.replace(/_/g, " ")}` : t("header.status"));

  const score = session?.humanizedSummary?.complianceScore !== undefined
    ? session.humanizedSummary.complianceScore
    : null;

  const isSuccess = !session || !session.status || session.status === "IDLE" || session.status.startsWith("COMPLETED") || session.status === "AWAITING_USER_UPLOAD";
  const badgeClass = isSuccess
    ? "border-fact/30 bg-fact-soft/30 text-fact"
    : "border-gap/40 bg-gap-soft/30 text-gap animate-pulse";

  const displayStatus = score !== null ? `${statusLabel} (Score: ${score}/100)` : statusLabel;

  return (
    <header className="border-b border-hairline bg-card/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:py-8">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-md border border-hairline bg-surface-elevated">
            <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {t("meta.kicker")}
            </p>
            <h1 className="mt-1 text-3xl font-normal text-foreground md:text-4xl">
              {productTitle}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${badgeClass}`}>
            <CircleDot className="h-3 w-3" />
            {displayStatus}
          </span>
          <span
            className="rounded-full border border-hairline bg-surface-elevated px-3 py-1.5 text-xs text-muted-foreground"
            suppressHydrationWarning
          >
            {t("header.generated")} {date}
          </span>

          <div
            role="group"
            aria-label={t("header.language")}
            className="inline-flex items-center overflow-hidden rounded-full border border-hairline bg-surface-elevated text-xs"
          >
            <Languages
              className="ml-2.5 mr-1 h-3.5 w-3.5 text-muted-foreground"
              strokeWidth={1.75}
            />
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={
                  "px-2.5 py-1.5 font-medium tracking-wide transition " +
                  (lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={toggle}
            aria-label={theme === "dark" ? t("header.theme.toLight") : t("header.theme.toDark")}
            title={theme === "dark" ? t("header.theme.toLight") : t("header.theme.toDark")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface-elevated text-muted-foreground transition hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
