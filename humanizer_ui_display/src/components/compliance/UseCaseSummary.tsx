import { FileSearch } from "lucide-react";
import { Tag } from "./Tag";
import { useI18n } from "@/lib/i18n";

export function UseCaseSummary() {
  const { t } = useI18n();
  return (
    <section className="rounded-lg border border-hairline bg-card p-7 md:p-9">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSearch className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t("sec1.kicker")}
          </h2>
        </div>
        <Tag variant="neutral">{t("sec1.agent")}</Tag>
      </div>

      <p className="font-heading text-2xl leading-relaxed text-foreground md:text-[28px] md:leading-[1.5]">
        {t("sec1.body.before")}{" "}
        <span className="bg-interpretation-soft/30 px-1 text-interpretation">
          {t("sec1.body.highlight")}
        </span>{" "}
        {t("sec1.body.after")}
      </p>

      <div className="mt-6 grid gap-5 border-t border-hairline pt-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-3">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
            {t("sec1.core.title")}
          </p>
          {t("sec1.core.body")}
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
            {t("sec1.users.title")}
          </p>
          {t("sec1.users.body")}
        </div>
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70">
            {t("sec1.deploy.title")}
          </p>
          {t("sec1.deploy.body")}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Tag variant="fact">{t("sec1.tag.sector")}</Tag>
        <Tag variant="fact">{t("sec1.tag.eu")}</Tag>
        <Tag variant="interpretation">{t("sec1.tag.annex")}</Tag>
        <Tag variant="gap">{t("sec1.tag.autonomy")}</Tag>
      </div>
    </section>
  );
}
