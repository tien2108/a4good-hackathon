import { useApp } from "@/components/compliance/AppContext";

export function useI18n() {
  const { lang, setLang, t } = useApp();
  
  const upperLang = lang.toUpperCase() as "EN" | "FI" | "SV";
  
  const setUpperLang = (l: "EN" | "FI" | "SV") => {
    setLang(l.toLowerCase() as "en" | "fi" | "sv");
  };

  return {
    lang: upperLang,
    setLang: setUpperLang,
    t,
  };
}
