import { ShieldCheck } from "lucide-react";
import { useApp } from "./AppContext";

export function BrandLogo({ className = "" }: { className?: string }) {
  const { t } = useApp();
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
        <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-gradient-brand">
          Norrin Ipsum
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("brand.tagline")}
        </span>
      </div>
    </div>
  );
}
