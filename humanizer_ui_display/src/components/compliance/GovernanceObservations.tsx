import { Eye, ScrollText, UserCog, Check } from "lucide-react";
import { Tag } from "./Tag";
import { useI18n } from "@/lib/i18n";

type Item = { textKey: string; tag: "fact" | "interpretation" };
const groups: { icon: typeof Eye; titleKey: string; items: Item[] }[] = [
  {
    icon: Eye,
    titleKey: "sec2.g1.title",
    items: [
      { textKey: "sec2.g1.i1", tag: "interpretation" },
      { textKey: "sec2.g1.i2", tag: "fact" },
      { textKey: "sec2.g1.i3", tag: "interpretation" },
    ],
  },
  {
    icon: ScrollText,
    titleKey: "sec2.g2.title",
    items: [
      { textKey: "sec2.g2.i1", tag: "fact" },
      { textKey: "sec2.g2.i2", tag: "interpretation" },
      { textKey: "sec2.g2.i3", tag: "interpretation" },
      { textKey: "sec2.g2.i4", tag: "fact" },
    ],
  },
  {
    icon: UserCog,
    titleKey: "sec2.g3.title",
    items: [
      { textKey: "sec2.g3.i1", tag: "interpretation" },
      { textKey: "sec2.g3.i2", tag: "fact" },
      { textKey: "sec2.g3.i3", tag: "interpretation" },
    ],
  },
];

export function GovernanceObservations() {
  const { t } = useI18n();
  return (
    <section className="rounded-lg border border-hairline bg-card">
      <header className="flex items-center justify-between gap-4 border-b border-hairline px-7 py-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t("sec2.kicker")}
          </p>
          <h2 className="mt-1 text-2xl text-foreground">
            {t("sec2.title")}
          </h2>
        </div>
        <Tag variant="neutral">{t("sec2.agent")}</Tag>
      </header>

      <div className="divide-y divide-hairline">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.titleKey} className="px-7 py-7">
              <div className="mb-5 flex items-center gap-3">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h3 className="text-base font-medium tracking-tight text-foreground">
                  {t(group.titleKey)}
                </h3>
              </div>
              <ul className="space-y-3.5">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-fact/30 bg-fact-soft/30">
                      <Check className="h-3 w-3 text-fact" strokeWidth={2.5} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {t(item.textKey)}
                      </p>
                      <div className="mt-1.5">
                        <Tag variant={item.tag}>
                          {item.tag === "fact" ? t("tag.fact") : t("tag.interpretation")}
                        </Tag>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
