import { Moon, Sun, Globe } from "lucide-react";
import { useApp } from "./AppContext";
import { LANGS } from "./i18n";
import { HistoryDropdown } from "./HistoryDropdown";

export function HeaderControls() {
  const { theme, toggleTheme, lang, setLang, t } = useApp();
  return (
    <div className="flex items-center gap-1.5">
      <HistoryDropdown />
      <div
        className="inline-flex items-center rounded-md border border-border bg-card p-0.5"
        role="group"
        aria-label={t("toggle.lang")}
      >
        <Globe className="mx-1 h-3.5 w-3.5 text-muted-foreground" />
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors ${
              lang === code
                ? "bg-gradient-brand text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={lang === code}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? t("toggle.theme.light") : t("toggle.theme.dark")
        }
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground/80 transition-colors hover:bg-muted"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
