import React, { useState } from "react";
import { 
  X, BookOpen, User, Code, Bot, Sparkles, Cpu, 
  Layers, HelpCircle, ArrowRight, ShieldAlert, Folder, 
  FileText, Activity, MessageSquare, AlertCircle
} from "lucide-react";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const [activeTab, setActiveTab] = useState<"user" | "developer">("user");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-3xl transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <article className="relative w-full max-w-6xl h-[92vh] max-h-[92vh] mt-4 sm:mt-6 flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-3xl transition-all duration-300 animate-scale-up">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-40 -left-40 -z-10 h-80 w-80 rounded-full bg-gradient-brand opacity-[0.08] blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 -z-10 h-80 w-80 rounded-full bg-gradient-brand opacity-[0.06] blur-3xl" />

        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/40 p-5 sm:p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand/10 ring-1 ring-inset ring-[color:var(--brand-via)]/20">
              <BookOpen className="h-5 w-5 text-[color:var(--brand-via)]" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                App Documentation & READMEs
              </h2>
              <p className="text-xs text-muted-foreground">
                Understand features or delve into the developer multi-agent specs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-border/60 bg-background/50 p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        {/* Tabs Control */}
        <div className="flex border-b border-border/30 bg-muted/20 px-6 py-2.5 gap-2">
          <button
            onClick={() => setActiveTab("user")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
              activeTab === "user"
                ? "bg-gradient-brand text-white shadow-md shadow-brand/10 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            For Casual Users
          </button>
          <button
            onClick={() => setActiveTab("developer")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
              activeTab === "developer"
                ? "bg-gradient-brand text-white shadow-md shadow-brand/10 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            For Developers
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin select-text">
          {activeTab === "user" ? (
            <div className="space-y-6 text-left animate-slide-up">
              {/* Introduction */}
              <section className="rounded-2xl border border-border/40 bg-background/30 p-5">
                <div className="flex gap-3.5">
                  <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand/10">
                    <Sparkles className="h-4.5 w-4.5 text-[color:var(--brand-via)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Welcome to the EU AI Act Compliance Sandbox!</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      This application is a cutting-edge playground designed to help organizations assess their artificial intelligence systems against the rules of the European Union AI Act. Through a team of cooperative automated agents, the app scans your design specifications and helps verify conformity.
                    </p>
                  </div>
                </div>
              </section>

              {/* Major User Functions */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/40 bg-card/40 p-4.5 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">1. Interactive File Dropper</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Upload system proposals, architecture descriptions, or specifications (in PDF or text format). Watch real-time upload progress indicators divided by **Agent 1 (Extraction)** and **Agent 2 (Ingestion)**.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4.5 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
                      <Layers className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">2. Visual Decision Tree</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Explore an interactive regulatory logic flow. Trace how a system's target sector, high-risk flags, or intended purpose map step-by-step to final EU AI Act classifications.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4.5 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="rounded-lg bg-violet-500/10 p-1.5 text-violet-500">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">3. Live Compliance Report</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Get an in-depth breakdown of governance ratings (transparency, human oversight, cybersecurity), complete with highlighted statutory citations (*Article 13*, etc.). Click any assumption card to open detailed explanations in a centered screen popup.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4.5 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
                      <Folder className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">4. Audit History & Folders</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Save audit reports into custom named folders. Toggle, rename, sort (date/alphabetical), or delete archive sessions in the top bar. You can swap states instantly with auto-save and active hot-backups.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card/40 p-4.5 hover:border-border/80 transition-colors sm:col-span-2">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="rounded-lg bg-[color:var(--brand-via)]/10 p-1.5 text-[color:var(--brand-via)]">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">5. Verda Legal Chat Copilot & Custom Alerts</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Ask Verda complex natural language questions on the EU AI Act or how to get started. The copilot retains context across turns to guide you. If you face server connectivity issues, dismiss notifications instantly or activate global alert silencing so they don't interrupt your work.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-left animate-slide-up">
              {/* Architecture Introduction */}
              <section className="rounded-2xl border border-border/40 bg-background/30 p-5">
                <div className="flex gap-3.5">
                  <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand/10">
                    <Cpu className="h-4.5 w-4.5 text-[color:var(--brand-via)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Multi-Agent Asynchronous Architecture</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      The backend system is structured around an event-driven <strong>Agent Communication Bus</strong> (`AgentBus`). Every AI agent inherits from the `BaseAgent` class and registers on the bus. When triggered, agents publish and subscribe to specific message types, cooperating asynchronously to compile a deep compliance analysis.
                    </p>
                  </div>
                </div>
              </section>

              {/* The 8 Agents Detailed */}
              <div>
                <h4 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/85">
                  Pipeline Agents (backend/src/agents)
                </h4>
                <div className="space-y-3.5">
                  {/* Agent 1 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-500">1</span>
                        <h5 className="text-xs font-bold text-foreground">Input Parser Agent (`InputParserAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-500 uppercase tracking-wider">Parser</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Ingests the initial file uploads (e.g. PDF or plain text). Employs OCR and parsing templates to map unstructured engineering specifications into core structured fields like the System Name, Sector, Intended Users, Outputs, and Intended Use Case.
                    </p>
                  </div>

                  {/* Agent 2 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-xs font-bold text-green-500">2</span>
                        <h5 className="text-xs font-bold text-foreground">Decision Tree Agent (`DecisionTreeAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-green-500 uppercase tracking-wider">Classifier</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Consumes the parsed document output. Executes systematic safety checks against the rules defined in `decision_tree_format.txt` to calculate risk levels (Unacceptable, High, Limited, or Minimal), and evaluates if essential product parameters are complete.
                    </p>
                  </div>

                  {/* Agent 3 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-500">3</span>
                        <h5 className="text-xs font-bold text-foreground">Judge of Governance Agent (`JudgeOfGovernanceAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-500 uppercase tracking-wider">Evaluator</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Assesses overall system governance. Uses LLM analysis to score and write reviews for 8 key organizational compliance domains (Documentation, Risk Management, Cybersecurity, etc.). Cite every dynamic observation with a matching EU AI Act article citation (e.g. <em>Article 9</em>, <em>Article 13</em>) and high-confidence text anchors.
                    </p>
                  </div>

                  {/* Agent 4 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-500">4</span>
                        <h5 className="text-xs font-bold text-foreground">Assumptions Checker Agent (`AssumptionsCheckerAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-500 uppercase tracking-wider">Auditor</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Scans the engineering texts for unstated assertions, logical gaps, or technological "leaps of faith". Flags potential risk mitigations, making assumptions visible and click-to-open so stakeholders can confirm technical limits.
                    </p>
                  </div>

                  {/* Agent 5 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold text-orange-500">5</span>
                        <h5 className="text-xs font-bold text-foreground">Missing Info Checker Agent (`MissingInfoCheckerAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-orange-500 uppercase tracking-wider">Coordinator</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Coordinates interactive chat-prompt loops. If the Decision Tree Agent finds vital information is missing or a document is rejected, this agent prompts the user to upload supplementary documents or skip to accept a lower confidence score.
                    </p>
                  </div>

                  {/* Agent 6 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-xs font-bold text-red-500">6</span>
                        <h5 className="text-xs font-bold text-foreground">Prevention of Confidence Agent (`PreventionOfConfidenceAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-red-500 uppercase tracking-wider">Red-Team</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Runs adversarial analysis checks to prevent machine hallucination and user blind trust. Challenges inconsistencies (e.g. claiming "completely biased-free HR model" but omitting bias metrics) and reports critical warnings.
                    </p>
                  </div>

                  {/* Agent 7 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-500">7</span>
                        <h5 className="text-xs font-bold text-foreground">Humanizer UI Display Agent (`HumanizerUiDisplayAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-500 uppercase tracking-wider">Humanizer</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Collects all technical assessments from other agents and converts dense regulatory language and JSON files into smooth, readable summaries, suitable for quick reviews by non-legal teams.
                    </p>
                  </div>

                  {/* Agent 8 */}
                  <div className="rounded-2xl border border-border/30 bg-muted/10 p-4.5 hover:border-border/60 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-xs font-bold text-teal-500">8</span>
                        <h5 className="text-xs font-bold text-foreground">Emailer Agent (`EmailerAgent.ts`)</h5>
                      </div>
                      <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal-500 uppercase tracking-wider">Sender</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <strong>Responsibilities:</strong> Package the final audit report, including observations, citations, unstated engineering assumptions, and adversarial alerts, into structured formats. Delivers compilation summaries securely to inbox addresses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Flow Diagram */}
              <section className="rounded-2xl border border-border/40 bg-background/30 p-5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                  <Layers className="h-4 w-4 text-[color:var(--brand-via)]" />
                  How They Cooperate & Flow
                </h4>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  The agents interact in a structured sequence triggered by files uploading to a session:
                </p>
                <div className="mt-4 flex flex-col gap-2.5 pl-3 border-l-2 border-border/60">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold text-[color:var(--brand-via)] mt-0.5">Ingest:</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      User uploads file → <strong>InputParser</strong> parses raw spec content to JSON → broadcasts parsed structure to the session.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold text-[color:var(--brand-via)] mt-0.5">Classify:</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong>DecisionTree</strong> receives structures → computes risk status → checks completeness. If incomplete, hands over to <strong>MissingInfoChecker</strong> to reprompt user.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold text-[color:var(--brand-via)] mt-0.5">Audit:</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      On complete parameters, <strong>JudgeOfGovernance</strong> scores the 8 categories & links Act Articles, while <strong>AssumptionsChecker</strong> identifies hidden technical assertions.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold text-[color:var(--brand-via)] mt-0.5">Verify:</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong>PreventionOfConfidence</strong> analyzes overall declarations for legal/logical inconsistencies.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold text-[color:var(--brand-via)] mt-0.5">Display:</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong>HumanizerUiDisplay</strong> translates files into the beautiful web dashboard view.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border/40 bg-muted/15 px-6 py-4">
          <p className="text-[10px] text-muted-foreground">
            EU AI Act Compliance Engine • Version 2.1 • Multi-Agent Pipeline
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Got it, close
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </footer>
      </article>
    </div>
  );
}
