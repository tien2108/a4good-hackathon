import { Scale, GitBranch, ArrowRight, ShieldAlert, CheckCircle2, Bot } from "lucide-react";
import { Tag } from "./Tag";
import { useBackendData } from "@/lib/backend-data";
import { useApp, type RiskTierId } from "./AppContext";

function parseCitation(citation: string) {
  // Matches "Article X (Description)" or "Article X - Description" or "Article X: Description"
  const parenIndex = citation.indexOf("(");
  if (parenIndex !== -1) {
    const header = citation.substring(0, parenIndex).trim();
    let body = citation.substring(parenIndex + 1).trim();
    if (body.endsWith(")")) {
      body = body.substring(0, body.length - 1).trim();
    }
    return { header, body };
  }
  
  // Try split on " - "
  const dashIndex = citation.indexOf(" - ");
  if (dashIndex !== -1) {
    const header = citation.substring(0, dashIndex).trim();
    const body = citation.substring(dashIndex + 3).trim();
    return { header, body };
  }

  // Try split on ": "
  const colonIndex = citation.indexOf(": ");
  if (colonIndex !== -1) {
    const header = citation.substring(0, colonIndex).trim();
    const body = citation.substring(colonIndex + 2).trim();
    return { header, body };
  }
  
  return { header: "EU AI Act Citation", body: citation };
}

function getArticleSnippet(text: string): string {
  const norm = text.toLowerCase();
  
  // Extract specific article number to avoid suffix/overlap false positives (e.g. Article 26 matching Article 2)
  const articleMatch = norm.match(/articles?\s+(\d+)/i);
  if (articleMatch) {
    const num = parseInt(articleMatch[1], 10);
    if (num === 2) {
      return "Article 2 (Scope & Exclusions) — Excludes scientific R&D, purely mathematical/theoretical models, or open-source software from the scope of the Act.";
    }
    if (num === 5) {
      return "Article 5 (Prohibited AI Practices) — Lists completely banned practices, including subliminal manipulation, social scoring, biometric profiling, or untargeted facial image scraping.";
    }
    if (num === 6) {
      return "Article 6 (High-Risk Classification) — Establishes statutory criteria for designating AI systems as High-Risk, linked to safety components or Annex III concerns.";
    }
    if (num === 9) {
      return "Article 9 (Risk Management System) — Mandates an active, continuous risk management process for High-Risk AI systems throughout their entire operational lifecycle.";
    }
    if (num === 10) {
      return "Article 10 (Data and Data Governance) — Requires High-Risk system datasets to be of high quality, representative, and completely free of systemic bias.";
    }
    if (num === 11) {
      return "Article 11 (Technical Documentation) — Mandates compiling exhaustive technical documentation proving regulatory compliance before market launch.";
    }
    if (num === 12) {
      return "Article 12 (Record-keeping & Logging) — Requires automated logging of operations and telemetry to ensure traceability throughout the system lifecycle.";
    }
    if (num === 13) {
      return "Article 13 (Transparency & Instructions) — Requires High-Risk AI systems to be designed transparently, with clear user instructions provided to deployers.";
    }
    if (num === 14) {
      return "Article 14 (Human Oversight) — Mandates that High-Risk systems are built such that natural persons can oversee, avoid automation bias, and override.";
    }
    if (num === 15) {
      return "Article 15 (Accuracy, Robustness & Security) — Requires High-Risk AI systems to achieve high accuracy, robustness, and state-of-the-art cybersecurity.";
    }
    if (num === 28) {
      return "Article 28 (GPAI Integration Liabilities) — Reclassifies a downstream deployer as a Provider if they modify, rename, or integrate a General Purpose AI.";
    }
    if (num === 50 || num === 52) {
      return "Article 50/52 (Transparency & Disclosures) — Mandates clear user notification when interacting with AI (e.g. chatbots, deepfakes, or AI-generated text).";
    }
    if (num === 95) {
      return "Article 95 (Codes of Conduct) — Promotes voluntary codes of conduct for minimal or low-risk AI systems to adhere to trustworthy AI principles.";
    }
  }

  if (norm.includes("annex i")) {
    return "Annex I (EU Harmonized Union Legislation) — Lists products (e.g. medical devices, machinery, civil aviation) subject to third-party conformity audits.";
  }
  if (norm.includes("annex iii")) {
    return "Annex III (High-Risk AI Use Cases) — Enumerates sensitive deployment domains, including biometric grading, critical infrastructure, and recruitment.";
  }
  return "EU AI Act Regulatory Citation — Establishes strict, harmonized statutory obligations to ensure safe, transparent, and trustworthy AI deployments.";
}

interface CitationTooltipProps {
  text: string;
  className?: string;
  children: React.ReactNode;
}

export function CitationTooltip({ text, className, children }: CitationTooltipProps) {
  const snippet = getArticleSnippet(text);
  return (
    <span className="relative group/tooltip inline-block cursor-help">
      <span className={className}>
        {children}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 w-72 -translate-x-1/2 scale-95 rounded-xl border border-zinc-800 bg-zinc-950/95 p-3.5 text-xs font-normal text-stone-200 opacity-0 shadow-xl transition-all duration-300 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 backdrop-blur-md leading-relaxed text-left normal-case tracking-normal">
        {snippet}
      </span>
    </span>
  );
}

function formatArticleText(text: string, riskTier?: RiskTierId) {
  // Matches "Article(s)", "Chapter(s)", "Annex(es)" followed by numbers or roman numerals
  const regex = /(Articles?\s+\d+(?:\.\d+)?(?:[a-z])?(?:\s*-\s*\d+(?:\.\d+)?(?:[a-z])?)?|Chapters?\s+[IVXLCDM\d]+|Annexes?\s+[IVXLCDM\d]+)/gi;
  
  let highlightClass = "text-muted-foreground font-semibold";
  if (riskTier === "unacceptable") {
    highlightClass = "italic font-extrabold text-red-500";
  } else if (riskTier === "high") {
    highlightClass = "italic font-extrabold text-orange-500";
  } else if (riskTier === "limited") {
    highlightClass = "italic font-extrabold text-yellow-500";
  } else if (riskTier === "minimal") {
    highlightClass = "italic font-extrabold text-green-500";
  } else if (riskTier === "out_of_scope") {
    highlightClass = "italic font-extrabold text-white";
  }
  
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    if (part.match(regex)) {
      return (
        <CitationTooltip key={idx} text={part} className={`${highlightClass} cursor-help underline decoration-dotted decoration-1`}>
          {part}
        </CitationTooltip>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

type CitationItemProps = {
  citation: string;
  riskTier: RiskTierId;
};

function CitationItem({ citation, riskTier }: CitationItemProps) {
  const { header, body } = parseCitation(citation);

  // Border & Glow Adaptive Styles for 5 levels (Red, Orange, Yellow, Green, White)
  let borderClass = "";
  let badgeBgClass = "";
  let tagColorClass = "";
  let iconGlowClass = "";

  if (riskTier === "unacceptable") {
    borderClass = "border-red-500/30 hover:border-red-500/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.12)]";
    badgeBgClass = "bg-red-500/10 border-red-500/20 text-red-500";
    tagColorClass = "text-red-500/80";
    iconGlowClass = "text-red-500";
  } else if (riskTier === "high") {
    borderClass = "border-orange-500/30 hover:border-orange-500/60 hover:shadow-[0_0_15px_rgba(249,115,22,0.12)]";
    badgeBgClass = "bg-orange-500/10 border-orange-500/20 text-orange-500";
    tagColorClass = "text-orange-500/80";
    iconGlowClass = "text-orange-500";
  } else if (riskTier === "limited") {
    borderClass = "border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-[0_0_15px_rgba(234,179,8,0.12)]";
    badgeBgClass = "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    tagColorClass = "text-yellow-500/80";
    iconGlowClass = "text-yellow-500";
  } else if (riskTier === "minimal") {
    borderClass = "border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_15px_rgba(34,197,94,0.12)]";
    badgeBgClass = "bg-green-500/10 border-green-500/20 text-green-500";
    tagColorClass = "text-green-500/80";
    iconGlowClass = "text-green-500";
  } else {
    // out_of_scope
    borderClass = "border-white/20 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.12)]";
    badgeBgClass = "bg-white/5 border-white/15 text-white";
    tagColorClass = "text-white/80";
    iconGlowClass = "text-white";
  }

  return (
    <li className={`group relative overflow-hidden rounded-xl border-2 ${borderClass} bg-zinc-950/80 p-5 shadow-lg transition-all duration-300`}>
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        {/* Left column: Citation Header */}
        <div className="flex flex-col gap-2">
          <div className={`inline-flex self-start items-center gap-1.5 rounded-md ${badgeBgClass} border px-2.5 py-1 shadow-sm`}>
            <span className="text-xs font-semibold tracking-wider leading-snug">
              {formatArticleText(header, riskTier)}
            </span>
          </div>
          <span className={`inline-flex self-start items-center rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-semibold ${tagColorClass} uppercase tracking-wider`}>
            EU Law Citation
          </span>
        </div>
        
        {/* Right column: System Interpretation */}
        <div className="rounded-lg bg-zinc-900/50 border border-zinc-800/40 p-3.5 flex flex-col justify-center">
          <span className={`text-[9px] font-bold ${iconGlowClass}/70 tracking-widest uppercase block mb-1`}>
            System Interpretation
          </span>
          <p className="text-xs md:text-sm text-stone-200 leading-relaxed font-sans font-medium">
            {formatArticleText(body, riskTier)}
          </p>
        </div>
      </div>
    </li>
  );
}

export function DecisionTreeAssessment() {
  const { session } = useBackendData();

  if (session?.riskClassification) {
    const riskClassification = session.riskClassification;
    
    // Parse classification title and citations
    const parts = riskClassification.split("**EU AI Act Flowchart Citations**:");
    const title = parts[0]?.replace(/\*\*/g, "").trim() || "Unclassified / Out of Scope (Article 2)";
    const citationsString = parts[1] || "";
    const citations = citationsString
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.startsWith("-") || line.startsWith("•"))
      .map(line => line.replace(/^[-•]\s*/, "").trim());

    // Map classification title to RiskTierId
    const titleLower = title.toLowerCase();
    let mappedRisk: RiskTierId = "minimal";
    if (titleLower.includes("unacceptable") || titleLower.includes("prohibited") || titleLower.includes("prohibition")) {
      mappedRisk = "unacceptable";
    } else if (titleLower.includes("high-risk") || titleLower.includes("high risk") || titleLower.includes("high")) {
      mappedRisk = "high";
    } else if (titleLower.includes("limited")) {
      mappedRisk = "limited";
    } else if (titleLower.includes("out of scope") || titleLower.includes("out-of-scope") || titleLower.includes("exempt") || titleLower.includes("article 2")) {
      mappedRisk = "out_of_scope";
    } else {
      mappedRisk = "minimal";
    }

    let badgeColor = "";
    let riskTierLabel = "";

    if (mappedRisk === "unacceptable") {
      badgeColor = "border-red-500/40 bg-red-500/10 text-red-500";
      riskTierLabel = "Prohibited AI Practice (Article 5)";
    } else if (mappedRisk === "high") {
      badgeColor = "border-orange-500/40 bg-orange-500/10 text-orange-500";
      riskTierLabel = "High-Risk AI System (Article 6)";
    } else if (mappedRisk === "limited") {
      badgeColor = "border-yellow-500/40 bg-yellow-500/10 text-yellow-500";
      riskTierLabel = "Limited Risk AI System (Article 50)";
    } else if (mappedRisk === "minimal") {
      badgeColor = "border-green-500/40 bg-green-500/10 text-green-500";
      riskTierLabel = "Minimal Risk AI System (Article 95/etc.)";
    } else {
      badgeColor = "border-white/30 bg-white/5 text-white";
      riskTierLabel = "Out of Scope / Exempt (Article 2)";
    }

    return (
      <section className="rounded-lg border border-hairline bg-card p-7 md:p-9">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scale className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Section 01.5 — Regulatory Risk Assessment
            </h2>
          </div>
          <Tag variant="neutral">Decision Tree Agent</Tag>
        </div>

        <div className="grid gap-6 md:grid-cols-[55fr_45fr]">
          {/* Left Panel: Classification */}
          <div className="flex flex-col justify-between border-b border-hairline pb-6 md:border-b-0 md:border-r md:border-hairline md:pb-0 md:pr-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}>
                  <ShieldAlert className="h-3 w-3" />
                  {riskTierLabel}
                </span>
              </div>
              <h3 className="mt-4 font-heading text-xl font-normal leading-snug text-foreground md:text-2xl">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-200 select-text text-left">
                {mappedRisk === "unacceptable" ? (
                  <>
                    This classification is strictly justified under <CitationTooltip text="Article 5" className="italic font-bold text-red-500 cursor-help underline decoration-dotted"><em>Article 5</em></CitationTooltip> of the EU AI Act. The system employs prohibited artificial intelligence practices, which include manipulative or deceptive techniques to distort behavior, exploitation of vulnerable groups, social scoring, biometric categorization based on sensitive attributes, or untargeted scraping of facial images. These applications pose an unacceptable threat to safety, livelihoods, and fundamental rights, and are completely prohibited from being placed on the market, put into service, or used within the Union.
                  </>
                ) : mappedRisk === "high" ? (
                  <>
                    This classification is strictly justified under <CitationTooltip text="Article 6" className="italic font-bold text-orange-500 cursor-help underline decoration-dotted"><em>Article 6(1)</em></CitationTooltip> and <CitationTooltip text="Article 6" className="italic font-bold text-orange-500 cursor-help underline decoration-dotted"><em>Article 6(2)</em></CitationTooltip> of the EU AI Act. The system functions as a safety component or is itself a medical device / safety component listed under Annex I, requiring mandatory third-party conformity assessments, or it falls within the high-risk critical infrastructure/employment use cases enumerated in <CitationTooltip text="Annex III" className="italic font-bold text-orange-500 cursor-help underline decoration-dotted"><em>Annex III</em></CitationTooltip>. Consequently, this system is subject to the rigorous compliance duties of Chapter II, including risk management, data governance, human oversight, and post-market monitoring.
                  </>
                ) : mappedRisk === "limited" ? (
                  <>
                    This classification is justified under <CitationTooltip text="Article 50" className="italic font-bold text-yellow-500 cursor-help underline decoration-dotted"><em>Article 50</em></CitationTooltip> (previously Article 52) of the EU AI Act. As an interactive AI chatbot or content-generation system, it does not pose high-risk physical or systemic safety hazards. However, it triggers strict transparency obligations. Deployers and providers must ensure that natural persons are explicitly informed that they are interacting with an AI system, satisfying mandatory disclosure and labeling requirements.
                  </>
                ) : mappedRisk === "minimal" ? (
                  <>
                    This classification is justified as it does not fall into any of the higher risk categories mentioned in <CitationTooltip text="Article 5" className="italic font-bold text-green-500 cursor-help underline decoration-dotted"><em>Article 5</em></CitationTooltip>, <CitationTooltip text="Article 6" className="italic font-bold text-green-500 cursor-help underline decoration-dotted"><em>Article 6</em></CitationTooltip>, <CitationTooltip text="Article 50" className="italic font-bold text-green-500 cursor-help underline decoration-dotted"><em>Article 50</em></CitationTooltip> of the EU AI Act. Minimal-risk AI systems (such as spam filters, smart inventory tooling, or AI in video games) constitute the vast majority of AI systems currently used. These systems do not pose significant risks to human safety or fundamental rights, and thus trigger zero mandatory compliance audits or pre-market certification duties.
                  </>
                ) : (
                  <>
                    This classification is justified under <CitationTooltip text="Article 2" className="italic font-bold text-white cursor-help underline decoration-dotted"><em>Article 2</em></CitationTooltip> of the EU AI Act. Purely mathematical studies, academic scientific research and development models, or simple software systems without automated decision-making capabilities fall completely outside the scope of the Act, triggering zero mandatory compliance audits or pre-market certification duties.
                  </>
                )}
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2 pt-4">
              <Tag variant="neutral">System-Interpreted Reasoning</Tag>
              {mappedRisk === "unacceptable" && <Tag variant="destructive">Prohibited AI System</Tag>}
              {mappedRisk === "high" && <Tag variant="gap">Mandatory Pre-Market Conformity</Tag>}
              {mappedRisk === "limited" && <Tag variant="interpretation">Transparency Disclosures</Tag>}
              {mappedRisk === "minimal" && <Tag variant="neutral">Minimal Risk Exemption</Tag>}
              {mappedRisk === "out_of_scope" && <Tag variant="neutral">Exempt Under Article 2</Tag>}
            </div>
          </div>

          {/* Right Panel: Got questions? Ask Verda! */}
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="space-y-4 max-w-sm">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Got compliance questions about this risk assessment or the specific Articles involved?
              </p>
              <button
                onClick={() => {
                  document.getElementById("verda-copilot")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-xs font-bold text-white shadow-glow hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                <Bot className="h-4 w-4" />
                Got questions? Ask Verda!
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (session && session.status !== "IDLE") {
    const isWaiting = session.status === "PARSING";
    const statusMsg = isWaiting
      ? "⏳ Waiting for Parser Agent to extract proposal parameters..."
      : "✨ Decision Tree Agent: Auditing regulatory risk classification under Article 6 & Annex III...";

    return (
      <section className="rounded-lg border border-hairline bg-card p-7 md:p-9 animate-pulse">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scale className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Section 01.5 — Regulatory Risk Assessment
            </h2>
          </div>
          <Tag variant="neutral">Decision Tree Agent</Tag>
        </div>

        <div className="grid gap-6 md:grid-cols-[55fr_45fr]">
          <div className="space-y-4 border-b border-hairline pb-6 md:border-b-0 md:border-r md:border-hairline md:pb-0 md:pr-6">
            <div>
              <div className="h-6 w-36 rounded-full bg-muted/30" />
              <div className="mt-4 h-8 w-5/6 rounded bg-muted/20" />
              <div className="mt-3 h-4 w-full rounded bg-muted/15" />
              <div className="mt-2 h-4 w-2/3 rounded bg-muted/15" />
            </div>
            
            <p className="text-xs font-semibold text-primary/70 tracking-wider uppercase">
              {statusMsg}
            </p>
          </div>

          <div className="space-y-4">
            <div className="h-3 w-40 rounded bg-muted/30" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-muted/20" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-full rounded bg-muted/15" />
                    <div className="h-3.5 w-5/6 rounded bg-muted/15" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback view when backend is offline
  return (
    <section className="rounded-lg border border-hairline bg-card p-7 md:p-9">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Scale className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Section 01.5 — Regulatory Risk Assessment
          </h2>
        </div>
        <Tag variant="neutral">Decision Tree Agent</Tag>
      </div>

      <div className="grid gap-6 md:grid-cols-[55fr_45fr]">
        <div className="flex flex-col justify-between border-b border-hairline pb-6 md:border-b-0 md:border-r md:border-hairline md:pb-0 md:pr-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                <ShieldAlert className="h-3 w-3" />
                High-Risk AI System (Article 6)
              </span>
            </div>
            <h3 className="mt-4 font-heading text-xl font-normal leading-snug text-foreground md:text-2xl">
              High-Risk AI System (Article 6.1 - Annex I Medical Device)
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Under <em>Article 6</em> of the EU AI Act, systems linked to safety components of products subject to third-party conformity assessments under Annex I are strictly designated as High-Risk and require robust compliance.
            </p>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2 pt-4">
            <Tag variant="neutral">System-Interpreted Reasoning</Tag>
            <Tag variant="gap">Mandatory Pre-Market Conformity</Tag>
          </div>
        </div>

        {/* Right Panel: Got questions? Ask Verda! */}
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="space-y-4 max-w-sm">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Got compliance questions about this risk assessment or the specific Articles involved?
            </p>
            <button
              onClick={() => {
                document.getElementById("verda-copilot")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-xs font-bold text-white shadow-glow hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <Bot className="h-4 w-4" />
              Got questions? Ask Verda!
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
