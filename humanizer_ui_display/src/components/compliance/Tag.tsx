import { cn } from "@/lib/utils";

type TagVariant = "fact" | "interpretation" | "gap" | "neutral";

const styles: Record<TagVariant, string> = {
  fact: "bg-fact-soft/40 text-fact border-fact/30",
  interpretation: "bg-interpretation-soft/40 text-interpretation border-interpretation/30",
  gap: "bg-gap-soft/40 text-gap border-gap/40",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Tag({
  variant = "neutral",
  children,
  className,
}: {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}