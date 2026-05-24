import { useApp } from "@/components/compliance/AppContext";

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

export function useBackendData() {
  const { backendSession } = useApp();
  
  const triggerEmail = async (email: string): Promise<boolean> => {
    if (!backendSession?.sessionId) return false;
    try {
      const res = await fetch(`${BACKEND_URL}/api/session/${backendSession.sessionId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  return {
    session: backendSession,
    hasBackendData: !!backendSession,
    triggerEmail,
  };
}
