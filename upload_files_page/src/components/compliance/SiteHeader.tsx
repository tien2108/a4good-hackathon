import { BrandLogo } from "./BrandLogo";
import { BookOpen } from "lucide-react";
import { HeaderControls } from "./HeaderControls";
import { useApp } from "./AppContext";

export function SiteHeader() {
  const { t } = useApp();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-1 md:flex">
          <a className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" href="#workspace">{t("nav.workspace")}</a>
          <a className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" href="#report">{t("nav.report")}</a>
          <a className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" href="#">
            <BookOpen className="h-3.5 w-3.5" /> {t("nav.docs")}
          </a>
        </nav>
        <HeaderControls />
      </div>
    </header>
  );
}
