import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface SessionState {
  sessionId: string;
  status: string;
  uploadedDocs: string[];
  parsedText: string | null;
  riskClassification: string | null;
  governanceData: any | null;
  proposalFacts: any | null;
  missingFields: string[];
  gaps: string[];
  assumptions: string[];
  preventionOutput: string | null;
  humanizedSummary: any | null;
  messages: any[];
}

interface BackendDataCtx {
  session: SessionState | null;
  hasBackendData: boolean;
  triggerEmail: (email: string) => Promise<boolean>;
}

const BackendDataContext = createContext<BackendDataCtx>({
  session: null,
  hasBackendData: false,
  triggerEmail: async () => false,
});

// Base URL for backend REST API connection. Reads from env or falls back to localhost:3001
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

export function BackendDataProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/session/latest`);
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        } else {
          setSession(null);
        }
      } catch (err) {
        // Fail silently to guarantee 100% UI stability when backend is not running
        setSession(null);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 1500);
    return () => clearInterval(interval);
  }, []);

  const triggerEmail = async (email: string): Promise<boolean> => {
    if (!session?.sessionId) return false;
    try {
      const res = await fetch(`${BACKEND_URL}/api/session/${session.sessionId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  const hasBackendData = !!session;

  return (
    <BackendDataContext.Provider value={{ session, hasBackendData, triggerEmail }}>
      {children}
    </BackendDataContext.Provider>
  );
}

export function useBackendData() {
  return useContext(BackendDataContext);
}
