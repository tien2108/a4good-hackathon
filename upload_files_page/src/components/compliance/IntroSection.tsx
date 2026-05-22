import { Layers, ShieldCheck, FileSearch, Sparkles } from "lucide-react";
import { useApp } from "./AppContext";

export function IntroSection() {
  const { t } = useApp();
  const features = [
    { icon: Layers, title: t("feature.synthesis.title"), body: t("feature.synthesis.body") },
    { icon: ShieldCheck, title: t("feature.risk.title"), body: t("feature.risk.body") },
    { icon: FileSearch, title: t("feature.evidence.title"), body: t("feature.evidence.body") },
  ];
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-[0.08] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3 w-3 text-[color:var(--brand-via)]" />
            {t("intro.badge")}
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
            {t("intro.title.prefix")}{" "}
            <span className="text-gradient-brand">{t("intro.title.accent")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            {t("intro.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-elegant transition-all hover:-translate-y-0.5 hover:border-[color:var(--brand-via)]/40"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-via)]/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand/10 ring-1 ring-inset ring-[color:var(--brand-via)]/20">
                <Icon className="h-5 w-5 text-[color:var(--brand-via)]" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
