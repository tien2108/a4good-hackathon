import { ReferenceSidebar } from "./ReferenceSidebar";
import { BookOpen, CheckCircle, ShieldAlert, Cpu, ArrowRight } from "lucide-react";
import { useApp } from "./AppContext";

export function Workspace() {
  const { status } = useApp();
  const isIdle = status === "idle";

  // When not idle (running or complete), we pivot completely to the dashboard layout 
  // managed by index.tsx, so this workspace is only rendered in the idle (landing) state.
  if (!isIdle) return null;

  return (
    <section id="workspace" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Compliance Guidelines and Steps Card */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-border bg-card/60 p-6 lg:p-8 shadow-elegant backdrop-blur h-full flex flex-col justify-between">
            <div>
              <header className="mb-6 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-brand text-white">
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Audit Guidelines & Multi-Agent Workflow
                </h2>
              </header>

              <div className="space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This interface connects directly to an autonomous EU AI Act regulatory review pipeline. Our multi-agent system extracts system facts, classifies risk categories, and audits mandatory compliance vectors. Follow these simple steps to conduct an audit:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background/40 p-4 relative group hover:border-[color:var(--brand-via)]/30 transition-all">
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">1. Stage System Docs</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      Upload system specs, architecture blueprints, or risk assessment drafts above.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background/40 p-4 relative group hover:border-[color:var(--brand-via)]/30 transition-all">
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">2. Risk Tree Evaluation</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      Our autonomous pipeline performs an interactive decision tree audit to classify system risk levels.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background/40 p-4 relative group hover:border-[color:var(--brand-via)]/30 transition-all">
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">3. Governance Audit</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      The Judge of Governance reviews files against 8 mandated EU AI Act compliance vectors.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-background/40 p-4 relative group hover:border-[color:var(--brand-via)]/30 transition-all">
                    <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">4. Contextual Resolution</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      If gaps are detected, submit additional papers directly inside the live dashboard to resolve them.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Autonomous Regulatory Intelligence · Version 2026.5</span>
              <span className="text-[color:var(--brand-via)] font-medium">EU AI Act Compliant</span>
            </div>
          </div>
        </div>

        {/* Reference Sidebar Column */}
        <div className="lg:col-span-2">
          <ReferenceSidebar />
        </div>
      </div>
    </section>
  );
}
