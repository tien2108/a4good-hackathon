import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, HelpCircle, ArrowRight, RefreshCw } from "lucide-react";
import { BACKEND_URL, useApp } from "./AppContext";
import { useBackendData } from "@/lib/backend-data";

interface Message {
  id: string;
  sender: "user" | "verda";
  text: string;
  timestamp: string;
}

function extractExpertQuestions(preventionOutput: string): string[] {
  if (!preventionOutput) return [];
  const lines = preventionOutput.split("\n");
  const questions: string[] = [];
  let isQuestionsSection = false;

  for (const line of lines) {
    if (line.includes("#### 🎓 AI Expert High-Standard Audit Questions:")) {
      isQuestionsSection = true;
      continue;
    }
    if (isQuestionsSection) {
      if (line.startsWith("####") || line.startsWith("---") || line.startsWith("###")) {
        isQuestionsSection = false;
        continue;
      }
      const match = line.match(/^\d+\.\s+\*\*(.*?)\*\*/);
      if (match && match[1]) {
        questions.push(match[1].trim());
      }
    }
  }
  return questions;
}

export function LandingChatbot() {
  const { t } = useApp();
  const { session } = useBackendData();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "verda",
      text: `### 👋 Hello, I'm Verda!

I'm your conversational EU AI Act Legal Compliance Copilot. How can I assist you today?

You can ask me about:
*   **⚠️ High-Risk AI & other risk tiers** (e.g. *"What is a high-risk system?"*)
*   **🏢 Legal Roles** (e.g. *"What is the difference between a provider and a deployer?"*)
*   **📁 How to use this platform & upload files** (e.g. *"How do I upload system specs?"*)
*   **🤖 The 8 Specialized Agents** (e.g. *"Which agents are running in the pipeline?"*)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [hasInjectedQuestions, setHasInjectedQuestions] = useState(false);

  // All 12 Legal Topics Pool
  const ALL_CHIPS = [
    { label: "What is high-risk AI?", text: "What is considered high-risk AI under the Act?" },
    { label: "What files can I upload?", text: "What file formats can I upload and what content is expected?" },
    { label: "Provider vs Deployer?", text: "What is the difference between a provider and a deployer?" },
    { label: "About the 8 agents", text: "Tell me about the 8 agents running in the compliance pipeline." },
    { label: "Article 6 classification", text: "How does Article 6 classification determine a system is High-Risk?" },
    { label: "Transparency duties", text: "What are the transparency obligations under Article 50?" },
    { label: "What is unacceptable risk?", text: "What AI systems fall under prohibited unacceptable risks?" },
    { label: "What is minimal risk?", text: "What constitutes a minimal/no-risk AI system under the Act?" },
    { label: "General purpose AI?", text: "How are General Purpose AI (GPAI) systems regulated?" },
    { label: "What are governance gaps?", text: "What are common governance gaps identified by the system?" },
    { label: "How to resolve gaps?", text: "How can I resolve the gaps or missing documents in the workflow?" },
    { label: "CE marking & compliance", text: "What is the CE marking process and compliance declaration under the Act?" }
  ];

  const [activeChips, setActiveChips] = useState<{ label: string; text: string }[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  // Function to shuffle and select 4 random chips
  const rotateChips = () => {
    const shuffled = [...ALL_CHIPS].sort(() => 0.5 - Math.random());
    setActiveChips(shuffled.slice(0, 4));
  };

  useEffect(() => {
    rotateChips();
  }, []);

  // Dynamically inject compliance expert's questions directly via Verda
  useEffect(() => {
    if (session?.preventionOutput && !hasInjectedQuestions) {
      const expertQuestions = extractExpertQuestions(session.preventionOutput);
      if (expertQuestions.length > 0) {
        const verdaQuestionText = `### 🕵️ Compliance Audit Questions for You:
I have audited your proposal and generated some critical questions to address. Please consider and respond to these:

${expertQuestions.map((q, idx) => `${idx + 1}. **${q}**`).join("\n\n")}

How would you like to address these high-standard auditing challenges?`;

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === "expert-questions");
          if (exists) return prev;
          
          return [
            ...prev,
            {
              id: "expert-questions",
              sender: "verda",
              text: verdaQuestionText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ];
        });

        // Set the active suggestions chips to let users directly click and ask them
        const chips = expertQuestions.map((q, idx) => ({
          label: `Audit Q${idx + 1}: ${q.substring(0, 30)}...`,
          text: q
        }));
        setActiveChips(chips);
        setHasInjectedQuestions(true);
      }
    }
  }, [session, hasInjectedQuestions]);

  // Auto Scroll - scroll only the messages container, keeping the main page position static
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build the full multi-turn conversation history for the LLM
      const historyPayload = updatedMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat server error");
      }

      const data = await response.json();
      const verdaMsg: Message = {
        id: `verda-${Date.now()}`,
        sender: "verda",
        text: data.reply || "I didn't receive a response from the compliance knowledge base.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, verdaMsg]);
    } catch (error) {
      console.error("[Chatbot] Fetch failed:", error);
      const errorMsg: Message = {
        id: `verda-error-${Date.now()}`,
        sender: "verda",
        text: "⚠️ **Connection Error**: I could not reach the legal compliance knowledge base. Please check if the local backend server is running on Port `3001`.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleSendMessage(inputValue);
  };

  return (
    <article id="verda-copilot" className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/50 shadow-elegant backdrop-blur-md p-5 sm:p-6 lg:p-7">
      {/* Background accent */}
      <div className="pointer-events-none absolute -right-32 -bottom-32 -z-10 h-64 w-64 rounded-full bg-gradient-brand opacity-[0.06] blur-2xl" />

      {/* Header */}
      <header className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand/10 ring-1 ring-inset ring-[color:var(--brand-via)]/20">
            <Bot className="h-5 w-5 text-[color:var(--brand-via)]" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                Verda Copilot
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-[color:var(--brand-via)]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[color:var(--brand-via)]">
                <Sparkles className="h-2 w-2" />
                Knowledge Base
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground sm:text-xs">
              Conversational EU AI Act Advisor
            </p>
          </div>
        </div>
        <HelpCircle 
          onClick={() => setShowInfo((prev) => !prev)}
          className={`h-4 w-4 cursor-pointer transition-all duration-200 ${showInfo ? "text-[color:var(--brand-via)] scale-110" : "text-muted-foreground/60 hover:text-muted-foreground hover:scale-105"}`} 
        />
      </header>

      {/* Copilot Info Card */}
      {showInfo && (
        <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4.5 text-xs shadow-xl backdrop-blur-md animate-fade-in relative text-left">
          <button
            onClick={() => setShowInfo(false)}
            className="absolute right-3.5 top-3.5 text-muted-foreground/60 hover:text-muted-foreground font-bold p-1 hover:scale-110 transition-transform"
          >
            ✕
          </button>
          <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand-via)] animate-pulse" />
            About Verda Copilot
          </h4>
          <p className="text-muted-foreground leading-relaxed mb-2.5">
            Verda is an autonomous legal AI expert trained on the official <strong>EU AI Act (Regulation EU 2024/1689)</strong>, statutory compliance guidelines, and multi-agent coordination architectures.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
            <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
              <span className="font-semibold text-foreground block mb-0.5">Specialized Corpus</span>
              <span className="text-muted-foreground leading-normal">Covers Articles 1-113, Annexes I-XVII, and harmonized standards for AI systems.</span>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
              <span className="font-semibold text-foreground block mb-0.5">Pipeline Core</span>
              <span className="text-muted-foreground leading-normal">Coordinates with the 8 specialized agents to extract precise facts, assess risks, and track evidence.</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages container - with custom scrollbar and internal ref scrolling */}
      <div
        ref={messagesContainerRef}
        className="relative mb-4 h-[320px] overflow-y-auto rounded-2xl border border-border/40 bg-background/30 p-4 scrollbar-thin"
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl text-xs font-semibold ring-1 ring-inset ${
                  msg.sender === "user"
                    ? "bg-gradient-brand/20 text-[color:var(--brand-via)] ring-[color:var(--brand-via)]/20"
                    : "bg-muted text-muted-foreground ring-border/50"
                }`}
              >
                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div className="space-y-1">
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-brand text-white font-medium rounded-tr-none"
                      : "bg-muted/75 text-foreground border border-border/40 rounded-tl-none"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="space-y-1.5 text-left select-text">
                      {formatMessageContent(msg.text)}
                    </div>
                  )}
                </div>
                <p
                  className={`text-[9px] text-muted-foreground/60 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {/* Typing state */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-inset ring-border/50">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted/75 border border-border/40 rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5 py-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Recommendation Chips with Shuffle/Refresh Button */}
      <div className="mb-4 text-left">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/75">
            Suggested Legal Topics
          </p>
          <button
            type="button"
            onClick={rotateChips}
            title="Shuffle Topics"
            className="inline-flex items-center gap-1 rounded bg-muted/50 hover:bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" />
            <span>Shuffle</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(chip.text)}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/50 px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted transition-all duration-150 disabled:opacity-50 hover:border-border-hover cursor-pointer"
            >
              <span>{chip.label}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Verda about EU AI Act compliance..."
          disabled={isLoading}
          className="min-w-0 flex-1 rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:border-[color:var(--brand-via)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-via)] transition-shadow disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-45 disabled:pointer-events-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </article>
  );
}

// Light-weight Custom Markdown Formatting Engine
function formatMessageContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    let trimmed = line.trim();
    
    // Header check
    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={index} className="text-xs font-bold text-foreground mt-3.5 mb-1.5 first:mt-0">
          {trimmed.slice(4)}
        </h4>
      );
    }
    
    // Ordered lists
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        const num = match[1];
        const content = match[2];
        return (
          <div key={index} className="pl-4 ml-1 relative text-[11px] leading-relaxed text-muted-foreground my-1">
            <span className="absolute left-0 font-bold text-[color:var(--brand-via)]">{num}.</span>
            {parseInline(content)}
          </div>
        );
      }
    }

    // Unordered lists
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const content = trimmed.slice(2);
      return (
        <div key={index} className="pl-4 ml-1 relative text-[11px] leading-relaxed text-muted-foreground my-1">
          <span className="absolute left-0 font-bold text-[color:var(--brand-via)]">•</span>
          {parseInline(content)}
        </div>
      );
    }
    
    if (trimmed === "") {
      return <div key={index} className="h-2" />;
    }

    // Regular line
    return (
      <p key={index} className="text-[11px] leading-relaxed text-muted-foreground my-1">
        {parseInline(line)}
      </p>
    );
  });
}

function parseInline(text: string) {
  const regex = /(\*\*.*?\*\*|\*[^*]+?\*|`.*?`|<i>.*?<\/i>)/g;
  const matchParts = text.split(regex);

  return matchParts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="italic text-foreground">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("<i>") && part.endsWith("</i>")) {
      return <i key={idx} className="italic text-foreground font-sans not-italic font-normal [font-style:italic]">{part.slice(3, -4)}</i>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={idx} className="px-1 py-0.5 rounded bg-muted-foreground/10 font-mono text-[10px] text-[color:var(--brand-via)]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
