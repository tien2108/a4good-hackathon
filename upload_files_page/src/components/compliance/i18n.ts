export type Lang = "en" | "fi" | "sv";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fi", label: "FI" },
  { code: "sv", label: "SV" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.workspace": "Workspace",
  "nav.report": "Report",
  "nav.docs": "Docs",
  "header.source": "Source",
  "header.cta": "Get Early Access",
  "brand.tagline": "AI Act · Compliance",
  "intro.badge": "EU Regulation 2024/1689 · Compliance Copilot",
  "intro.title.prefix": "EU AI Act",
  "intro.title.accent": "Compliance Checker",
  "intro.subtitle":
    "Transform complex compliance documentation into grounded, auditable regulatory insights.",
  "feature.synthesis.title": "Smarter Synthesis",
  "feature.synthesis.body":
    "Ingest use-case studies, technical whitepapers, and product policies simultaneously to create a unified structural understanding.",
  "feature.risk.title": "Automated Risk Mapping",
  "feature.risk.body":
    "Evaluate your system architecture against the official EU AI Act risk tiers, prohibited practices, and special GPAI classifications.",
  "feature.evidence.title": "Auditable Evidence",
  "feature.evidence.body":
    "Produce granular compliance checklists and preliminary reviews backed by strict source-separated citations.",
  "ingest.title": "Ingestion Pipeline",
  "ingest.subtitle": "Stage your implementation documentation for autonomous review.",
  "ingest.step": "Step 1 of 2",
  "ingest.staged": "files staged",
  "ingest.addMore": "Add more files",
  "ingest.expand": "Expand",
  "ingest.collapse": "Collapse",
  "drop.title": "Drop your implementation files here",
  "drop.or": "or",
  "drop.browse": "browse",
  "drop.formats": "PDF · DOCX · TXT · XLSX",
  "context.label": "Optional Use-Case Context & System Description",
  "context.placeholder":
    "Describe the intended purpose, deployment context, target end-users, automated decision boundaries, and human oversight measures of your AI system...",
  "context.hint":
    "The more context you provide, the more grounded the resulting risk classification.",
  "analyze.cta": "Initialize Regulatory Analysis",
  "analyze.note": "Runs locally · No data leaves your browser in this preview",
  "analyze.stage.1": "Parsing use-case documents...",
  "analyze.stage.2": "Querying reference corpus...",
  "analyze.stage.3": "Running multi-agent analysis loop...",
  "ref.title": "Regulatory Reference",
  "ref.tab.risk": "Risk Classifications",
  "ref.tab.penalties": "Financial Penalties",
  "tier.unacceptable": "Unacceptable Risk",
  "tier.unacceptable.chip": "Prohibited",
  "tier.unacceptable.ex":
    "Social scoring, emotion recognition in workplaces, manipulative subliminal techniques.",
  "tier.high": "High Risk",
  "tier.high.chip": "Strictly Regulated",
  "tier.high.ex":
    "Critical infrastructure, education access, employment screening, biometric ID.",
  "tier.limited": "Limited Risk",
  "tier.limited.chip": "Transparency",
  "tier.limited.ex": "Chatbots, deepfake disclosure, AI-generated content labeling.",
  "tier.minimal": "Minimal Risk",
  "tier.minimal.chip": "Free Use",
  "tier.minimal.ex": "Spam filters, AI in video games, inventory optimization tooling.",
  "pen.prohibited.label": "Prohibited Practices",
  "pen.prohibited.note": "Highest fine bracket — whichever amount is greater.",
  "pen.prohibited.suffix": "or 7% global turnover",
  "pen.high.label": "High / Limited-Risk Violations",
  "pen.high.suffix": "or 3% global turnover",
  "pen.high.note":
    "Applies to obligations on providers and deployers of regulated systems.",
  "pen.foot":
    "Penalties for SMEs and start-ups are capped at the lower of the two thresholds. National competent authorities enforce.",
  "report.title": "Compliance Assessment & Analysis Report",
  "report.subtitle":
    "Outputs from the multi-agent regulatory review pipeline will render here.",
  "report.empty.title": "No active analysis session",
  "report.empty.body":
    "Upload your implementation proposal files and click \"Initialize Regulatory Analysis\" above to activate the autonomous multi-agent review team.",
  "report.modules": "Output Modules · Awaiting Data",
  "report.status.awaiting": "Awaiting input",
  "report.status.running": "Analysis in progress",
  "report.status.complete": "Preliminary result ready",
  "report.risk.preliminary": "Preliminary risk classification",
  "report.risk.exploring": "Risk Classification Agent exploring tiers...",
  "report.risk.settled": "Concrete classification produced by Risk Agent",
  "report.section.useCase": "Use-Case Summary",
  "report.section.useCase.desc":
    "Synthesised narrative of system purpose, scope, and deployment context.",
  "report.section.ops": "Operational Facts",
  "report.section.ops.desc":
    "Extracted technical and procedural facts grounded in source documents.",
  "report.section.risk": "Risk & Rule Assessment",
  "report.section.risk.desc":
    "Preliminary classification across AI Act tiers and GPAI articles.",
  "report.section.gov": "Governance Observations",
  "report.section.gov.desc":
    "Practical observations and a document checklist for compliance readiness.",
  "report.section.unc": "Uncertainties & Follow-up",
  "report.section.unc.desc":
    "Open questions, missing information, and an interactive clarification chat.",
  "report.section.cite": "Grounded Citations",
  "report.section.cite.desc":
    "Source-separated cards proving every claim back to its origin paragraph.",
  "disclaimer.label": "Disclaimer:",
  "disclaimer.body":
    "This application is an informational decision-support tool configured for structured regulatory review. It does not provide final legal advice or authoritative compliance verification under EU law.",
  "footer.note":
    "Built for EU Regulation 2024/1689 · Reference corpus version 1.0",
  "toggle.theme.light": "Switch to light mode",
  "toggle.theme.dark": "Switch to dark mode",
  "toggle.lang": "Language",
};

const fi: Dict = {
  "nav.workspace": "Työtila",
  "nav.report": "Raportti",
  "nav.docs": "Ohjeet",
  "header.source": "Lähde",
  "header.cta": "Hae ennakkokäyttöä",
  "brand.tagline": "Tekoälyasetus · Vaatimustenmukaisuus",
  "intro.badge": "EU-asetus 2024/1689 · Compliance Copilot",
  "intro.title.prefix": "EU:n tekoälyasetuksen",
  "intro.title.accent": "vaatimustenmukaisuustarkistin",
  "intro.subtitle":
    "Muunna monimutkainen vaatimustenmukaisuusaineisto perustelluiksi ja auditoitaviksi sääntelynäkemyksiksi.",
  "feature.synthesis.title": "Älykäs synteesi",
  "feature.synthesis.body":
    "Käsittele käyttötapauksia, teknisiä asiakirjoja ja tuotekäytäntöjä yhtäaikaisesti yhtenäiseksi ymmärrykseksi.",
  "feature.risk.title": "Automaattinen riskikartoitus",
  "feature.risk.body":
    "Arvioi järjestelmäsi virallisia EU AI Act -riskitasoja, kiellettyjä käytäntöjä ja GPAI-luokituksia vasten.",
  "feature.evidence.title": "Auditoitava näyttö",
  "feature.evidence.body":
    "Tuota yksityiskohtaisia tarkistuslistoja ja ennakkoarvioita lähdeviittauksin tuettuna.",
  "ingest.title": "Aineiston syöttö",
  "ingest.subtitle": "Lataa toteutusdokumentit autonomista tarkastusta varten.",
  "ingest.step": "Vaihe 1 / 2",
  "ingest.staged": "tiedostoa valmiina",
  "ingest.addMore": "Lisää tiedostoja",
  "ingest.expand": "Laajenna",
  "ingest.collapse": "Pienennä",
  "drop.title": "Pudota toteutustiedostot tähän",
  "drop.or": "tai",
  "drop.browse": "selaa",
  "drop.formats": "PDF · DOCX · TXT · XLSX",
  "context.label": "Vapaaehtoinen käyttötapauksen kuvaus",
  "context.placeholder":
    "Kuvaa järjestelmän tarkoitus, käyttöympäristö, loppukäyttäjät, automaattiset päätökset ja ihmisvalvonta...",
  "context.hint": "Mitä tarkempi konteksti, sitä luotettavampi riskiluokitus.",
  "analyze.cta": "Käynnistä sääntelyanalyysi",
  "analyze.note": "Toimii paikallisesti · Tiedot eivät poistu selaimestasi",
  "analyze.stage.1": "Käsitellään käyttötapauksia...",
  "analyze.stage.2": "Haetaan vertailuaineistoa...",
  "analyze.stage.3": "Suoritetaan moniagenttianalyysiä...",
  "ref.title": "Sääntelyviite",
  "ref.tab.risk": "Riskiluokat",
  "ref.tab.penalties": "Sakot",
  "tier.unacceptable": "Ei-hyväksyttävä riski",
  "tier.unacceptable.chip": "Kielletty",
  "tier.unacceptable.ex":
    "Sosiaalinen pisteytys, tunteentunnistus työpaikoilla, manipuloivat tekniikat.",
  "tier.high": "Korkea riski",
  "tier.high.chip": "Tiukasti säännelty",
  "tier.high.ex":
    "Kriittinen infrastruktuuri, koulutus, rekrytointi, biometrinen tunnistus.",
  "tier.limited": "Rajoitettu riski",
  "tier.limited.chip": "Läpinäkyvyys",
  "tier.limited.ex": "Chatbotit, deepfake-merkinnät, tekoälysisällön merkitseminen.",
  "tier.minimal": "Vähäinen riski",
  "tier.minimal.chip": "Vapaa käyttö",
  "tier.minimal.ex": "Roskapostisuodattimet, pelit, varastonhallinta.",
  "pen.prohibited.label": "Kielletyt käytännöt",
  "pen.prohibited.note": "Korkein sakkoluokka — kumpi tahansa suurempi.",
  "pen.prohibited.suffix": "tai 7 % maailmanlaajuisesta liikevaihdosta",
  "pen.high.label": "Korkean / rajoitetun riskin rikkomukset",
  "pen.high.suffix": "tai 3 % maailmanlaajuisesta liikevaihdosta",
  "pen.high.note":
    "Koskee säänneltyjen järjestelmien tarjoajia ja käyttöönottajia.",
  "pen.foot":
    "Pk-yritysten sakot rajoitetaan alempaan kynnykseen. Kansalliset viranomaiset valvovat.",
  "report.title": "Vaatimustenmukaisuus- ja analyysiraportti",
  "report.subtitle":
    "Moniagenttisen sääntelyanalyysin tulokset näkyvät tässä.",
  "report.empty.title": "Ei aktiivista analyysiä",
  "report.empty.body":
    "Lataa toteutusdokumentit ja paina \"Käynnistä sääntelyanalyysi\" aktivoidaksesi autonomisen analyysitiimin.",
  "report.modules": "Tulostemoduulit · Odottaa tietoja",
  "report.status.awaiting": "Odottaa syötettä",
  "report.status.running": "Analyysi käynnissä",
  "report.status.complete": "Alustava tulos valmis",
  "report.risk.preliminary": "Alustava riskiluokitus",
  "report.risk.exploring": "Riskiluokitusagentti tutkii tasoja...",
  "report.risk.settled": "Riskiagentin konkreettinen luokitus",
  "report.section.useCase": "Käyttötapauksen tiivistelmä",
  "report.section.useCase.desc":
    "Synteettinen kuvaus järjestelmän tarkoituksesta ja käyttöympäristöstä.",
  "report.section.ops": "Operatiiviset faktat",
  "report.section.ops.desc":
    "Lähteistä poimitut tekniset ja menettelylliset faktat.",
  "report.section.risk": "Riski- ja sääntöarvio",
  "report.section.risk.desc": "Alustava luokitus AI Act -tasoilla ja GPAI-artikloissa.",
  "report.section.gov": "Hallintohavainnot",
  "report.section.gov.desc":
    "Käytännön havainnot ja dokumenttitarkistuslista valmiudesta.",
  "report.section.unc": "Epävarmuudet & jatkotoimet",
  "report.section.unc.desc":
    "Avoimet kysymykset, puuttuvat tiedot ja interaktiivinen chat.",
  "report.section.cite": "Lähdeviittaukset",
  "report.section.cite.desc":
    "Lähde-erotetut kortit, jotka todistavat jokaisen väitteen.",
  "disclaimer.label": "Vastuuvapauslauseke:",
  "disclaimer.body":
    "Tämä sovellus on informatiivinen päätöksenteon tuki. Se ei anna lopullista oikeudellista neuvontaa eikä virallista vaatimustenmukaisuuden vahvistusta EU-lainsäädännön nojalla.",
  "footer.note":
    "Rakennettu EU-asetukselle 2024/1689 · Viiteaineisto v1.0",
  "toggle.theme.light": "Vaihda vaaleaan tilaan",
  "toggle.theme.dark": "Vaihda tummaan tilaan",
  "toggle.lang": "Kieli",
};

const sv: Dict = {
  "nav.workspace": "Arbetsyta",
  "nav.report": "Rapport",
  "nav.docs": "Dokument",
  "header.source": "Källa",
  "header.cta": "Få tidig åtkomst",
  "brand.tagline": "AI-förordningen · Efterlevnad",
  "intro.badge": "EU-förordning 2024/1689 · Compliance Copilot",
  "intro.title.prefix": "EU:s AI-förordning",
  "intro.title.accent": "Efterlevnadskontroll",
  "intro.subtitle":
    "Förvandla komplex efterlevnadsdokumentation till underbyggda och granskningsbara regulatoriska insikter.",
  "feature.synthesis.title": "Smartare syntes",
  "feature.synthesis.body":
    "Bearbeta användningsfall, tekniska dokument och produktpolicys samtidigt till en enhetlig förståelse.",
  "feature.risk.title": "Automatisk riskkartläggning",
  "feature.risk.body":
    "Utvärdera ditt system mot AI-förordningens officiella risknivåer, förbjudna metoder och GPAI-klassificeringar.",
  "feature.evidence.title": "Granskningsbara bevis",
  "feature.evidence.body":
    "Producera detaljerade checklistor och preliminära granskningar med strikta källhänvisningar.",
  "ingest.title": "Inläsningspipeline",
  "ingest.subtitle": "Förbered dina implementeringsdokument för autonom granskning.",
  "ingest.step": "Steg 1 av 2",
  "ingest.staged": "filer förberedda",
  "ingest.addMore": "Lägg till filer",
  "ingest.expand": "Expandera",
  "ingest.collapse": "Minimera",
  "drop.title": "Släpp dina implementeringsfiler här",
  "drop.or": "eller",
  "drop.browse": "bläddra",
  "drop.formats": "PDF · DOCX · TXT · XLSX",
  "context.label": "Valfri beskrivning av användningsfall",
  "context.placeholder":
    "Beskriv systemets syfte, driftsmiljö, slutanvändare, automatiska beslut och mänsklig tillsyn...",
  "context.hint": "Mer kontext ger en mer underbyggd riskklassificering.",
  "analyze.cta": "Starta regulatorisk analys",
  "analyze.note": "Körs lokalt · Ingen data lämnar din webbläsare",
  "analyze.stage.1": "Bearbetar användningsfall...",
  "analyze.stage.2": "Söker i referenskorpus...",
  "analyze.stage.3": "Kör multi-agent-analys...",
  "ref.title": "Regulatorisk referens",
  "ref.tab.risk": "Riskklassificeringar",
  "ref.tab.penalties": "Böter",
  "tier.unacceptable": "Oacceptabel risk",
  "tier.unacceptable.chip": "Förbjuden",
  "tier.unacceptable.ex":
    "Social poängsättning, känsloigenkänning på arbetsplatser, manipulativa tekniker.",
  "tier.high": "Hög risk",
  "tier.high.chip": "Strikt reglerad",
  "tier.high.ex":
    "Kritisk infrastruktur, utbildning, rekrytering, biometrisk ID.",
  "tier.limited": "Begränsad risk",
  "tier.limited.chip": "Transparens",
  "tier.limited.ex": "Chatbotar, deepfake-märkning, märkning av AI-innehåll.",
  "tier.minimal": "Minimal risk",
  "tier.minimal.chip": "Fri användning",
  "tier.minimal.ex": "Spamfilter, AI i spel, lagerhanteringsverktyg.",
  "pen.prohibited.label": "Förbjudna metoder",
  "pen.prohibited.note": "Högsta bötesnivå — det belopp som är högst.",
  "pen.prohibited.suffix": "eller 7 % av global omsättning",
  "pen.high.label": "Brott mot hög/begränsad risk",
  "pen.high.suffix": "eller 3 % av global omsättning",
  "pen.high.note":
    "Gäller skyldigheter för leverantörer och användare av reglerade system.",
  "pen.foot":
    "Böter för SME och startups begränsas till den lägre tröskeln. Nationella myndigheter ansvarar.",
  "report.title": "Efterlevnadsbedömning & analysrapport",
  "report.subtitle":
    "Resultaten från multi-agent-granskningen visas här.",
  "report.empty.title": "Ingen aktiv analys",
  "report.empty.body":
    "Ladda upp dina implementeringsfiler och klicka \"Starta regulatorisk analys\" för att aktivera det autonoma granskningsteamet.",
  "report.modules": "Resultatmoduler · Väntar på data",
  "report.status.awaiting": "Väntar på indata",
  "report.status.running": "Analys pågår",
  "report.status.complete": "Preliminärt resultat klart",
  "report.risk.preliminary": "Preliminär riskklassificering",
  "report.risk.exploring": "Riskklassificeringsagenten utforskar nivåer...",
  "report.risk.settled": "Konkret klassificering från Riskagenten",
  "report.section.useCase": "Sammanfattning av användningsfall",
  "report.section.useCase.desc":
    "Syntetiserad beskrivning av systemets syfte och driftskontext.",
  "report.section.ops": "Operativa fakta",
  "report.section.ops.desc":
    "Tekniska och procedurella fakta extraherade från källdokument.",
  "report.section.risk": "Risk- och regelbedömning",
  "report.section.risk.desc":
    "Preliminär klassificering över AI Act-nivåer och GPAI-artiklar.",
  "report.section.gov": "Styrningsobservationer",
  "report.section.gov.desc":
    "Praktiska observationer och dokumentchecklista för efterlevnad.",
  "report.section.unc": "Osäkerheter & uppföljning",
  "report.section.unc.desc":
    "Öppna frågor, saknad information och interaktiv chatt.",
  "report.section.cite": "Källhänvisningar",
  "report.section.cite.desc":
    "Källseparerade kort som styrker varje påstående.",
  "disclaimer.label": "Ansvarsfriskrivning:",
  "disclaimer.body":
    "Denna applikation är ett informativt beslutsstöd för strukturerad regulatorisk granskning. Den utgör inte slutgiltig juridisk rådgivning eller auktoritativ verifiering enligt EU-lag.",
  "footer.note":
    "Byggd för EU-förordning 2024/1689 · Referenskorpus v1.0",
  "toggle.theme.light": "Växla till ljust läge",
  "toggle.theme.dark": "Växla till mörkt läge",
  "toggle.lang": "Språk",
};

export const DICTS: Record<Lang, Dict> = { en, fi, sv };
