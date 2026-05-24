import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "EN" | "FI" | "SV";

type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = {
  EN: {
    "meta.kicker": "EU AI Act · Compliance Review",
    "header.product": "Norrin Ipsum",
    "header.status": "Analysis Phase: Complete",
    "header.generated": "Generated",
    "header.theme.toLight": "Switch to light mode",
    "header.theme.toDark": "Switch to dark mode",
    "header.language": "Language",

    "sec1.kicker": "Section 01 — Humanized Use-Case Summary",
    "sec1.agent": "Input Parser Agent",
    "sec1.body.before": "The system is an",
    "sec1.body.highlight": "AI-assisted underwriting copilot",
    "sec1.body.after":
      "designed to triage incoming commercial insurance applications, synthesize risk narratives from unstructured broker submissions, and recommend coverage tiers to licensed human underwriters.",
    "sec1.core.title": "Core Purpose",
    "sec1.core.body":
      "Accelerate first-pass risk evaluation and surface coverage anomalies for underwriter sign-off.",
    "sec1.users.title": "Target End-Users",
    "sec1.users.body":
      "Internal commercial-lines underwriters and senior risk officers at a mid-market European insurer.",
    "sec1.deploy.title": "Deployment Framework",
    "sec1.deploy.body":
      "Private-cloud SaaS, EU data residency, integrated with the insurer's policy administration system via signed API.",
    "sec1.tag.sector": "Uploaded-Doc Fact · Sector: Insurance",
    "sec1.tag.eu": "Uploaded-Doc Fact · EU Deployment",
    "sec1.tag.annex": "Interpretation · High-Risk Annex III candidate",
    "sec1.tag.autonomy": "Gap · Autonomy ceiling unverified",

    "sec2.kicker": "Section 02",
    "sec2.title": "Deduced Governance Observations",
    "sec2.agent": "Compliance Reasoning Engine",
    "sec2.g1.title": "Human Oversight Frameworks",
    "sec2.g1.i1": "Active monitoring dashboard surfaced to a named underwriting supervisor during business hours.",
    "sec2.g1.i2": "Manual intervention override on every coverage recommendation — no auto-binding of policies.",
    "sec2.g1.i3": "Mandatory two-person review for recommendations flagged above a configurable risk threshold.",
    "sec2.g2.title": "Lifecycle Logging & Documentation",
    "sec2.g2.i1": "Automated execution tracing of every model invocation with immutable, timestamped event logs.",
    "sec2.g2.i2": "Data lineage mapping from broker submission through feature extraction to model output.",
    "sec2.g2.i3": "Versioned technical documentation maintained in sync with each model release candidate.",
    "sec2.g2.i4": "Retention policy aligned to Article 19 — minimum six months, configurable per tenant.",
    "sec2.g3.title": "Accountability & Role Clarity",
    "sec2.g3.i1": "Organization acts as the system Provider for the underlying model and as Deployer in its internal rollout.",
    "sec2.g3.i2": "Named accountable executive recorded against the AI system registry entry.",
    "sec2.g3.i3": "Incident response runbook published and rehearsed quarterly with the risk committee.",
    "tag.fact": "Uploaded-Doc Fact",
    "tag.interpretation": "Interpretation",

    "sec3.kicker": "Section 03 · Risk Boundaries",
    "sec3.title": "Preventions of Confident Expectation",
    "sec3.subtitle": "Synthesized by the assumption & missing-information checkers.",
    "sec3.uncertainty.title": "Uncertainty Flags",
    "sec3.uncertainty.open": "open",
    "sec3.u1": "Training data origin for the risk-narrative encoder is partially undocumented (third-party fine-tune).",
    "sec3.u2": "Operational scale of autonomous decisioning above the underwriter override threshold is unverified.",
    "sec3.u3": "Bias-testing results for cross-border applicants have not been provided to the review pipeline.",
    "sec3.u4": "Subprocessor list for the embedding model has not been confirmed against EU data-residency claims.",
    "sec3.actions.title": "Open Action Items",
    "sec3.a1": "Request signed data-provenance attestation from the upstream model vendor.",
    "sec3.a2": "Obtain 12-month sample of override-rate telemetry to calibrate autonomy scoring.",
    "sec3.a3": "Confirm whether the system is offered to external insurers (changes Provider/Deployer posture).",
    "sec3.a4": "Run a fundamental rights impact assessment covering protected-class proxy variables.",
    "sec3.a5": "Clarify retention timelines for rejected applicant submissions beyond the policy lifecycle.",

    "dock.kicker": "Report Distribution Actions",
    "dock.pdf": "Export Document Report (PDF)",
    "dock.ppt": "Export Briefing Deck (PPT)",
    "dock.email.placeholder": "Enter stakeholder email address (e.g., compliance@company.com)...",
    "dock.send": "Send Report Package",
    "dock.sending": "Dispatching reports via backend pipelines...",
    "dock.toast.pdf": "Preparing PDF export…",
    "dock.toast.ppt": "Preparing briefing deck…",
    "dock.toast.invalid": "Please enter a valid email address.",
    "dock.toast.success": "Compliance artifacts successfully emailed to recipient.",

    "footer.label": "Advisory Note:",
    "footer.text":
      "This interface displays an autonomous decision-support assessment for review facilitation. It does not constitute binding legal counsel or official regulatory certification.",
  },
  FI: {
    "meta.kicker": "EU:n tekoälyasetus · Vaatimustenmukaisuusarvio",
    "header.product": "Norrin Ipsum",
    "header.status": "Analyysivaihe: Valmis",
    "header.generated": "Luotu",
    "header.theme.toLight": "Vaihda vaaleaan tilaan",
    "header.theme.toDark": "Vaihda tummaan tilaan",
    "header.language": "Kieli",

    "sec1.kicker": "Osa 01 — Inhimillinen käyttötapauksen tiivistelmä",
    "sec1.agent": "Syötteen jäsennysagentti",
    "sec1.body.before": "Järjestelmä on",
    "sec1.body.highlight": "tekoälyavusteinen vakuutusarvioinnin kopiloitti",
    "sec1.body.after":
      "joka triageoi saapuvia yritysvakuutushakemuksia, syntetisoi riskikuvaukset jäsentämättömistä välittäjäsyötteistä ja suosittelee kattavuustasoja lisensoiduille vakuutusarvioijille.",
    "sec1.core.title": "Päätarkoitus",
    "sec1.core.body":
      "Nopeuttaa ensivaiheen riskiarviointia ja tuoda esiin kattavuuspoikkeamat arvioijan vahvistettavaksi.",
    "sec1.users.title": "Loppukäyttäjät",
    "sec1.users.body":
      "Yritysvakuutusten arvioijat ja vanhemmat riskipäälliköt keskisuuressa eurooppalaisessa vakuutusyhtiössä.",
    "sec1.deploy.title": "Käyttöönottokehys",
    "sec1.deploy.body":
      "Yksityispilvi-SaaS, EU-datasijainti, integroitu vakuutusyhtiön vakuutushallintajärjestelmään allekirjoitetun rajapinnan kautta.",
    "sec1.tag.sector": "Ladattu asiakirjafakta · Toimiala: Vakuutus",
    "sec1.tag.eu": "Ladattu asiakirjafakta · EU-käyttöönotto",
    "sec1.tag.annex": "Tulkinta · Korkean riskin Liite III -ehdokas",
    "sec1.tag.autonomy": "Aukko · Autonomian katto vahvistamatta",

    "sec2.kicker": "Osa 02",
    "sec2.title": "Päätellyt hallintohavainnot",
    "sec2.agent": "Vaatimustenmukaisuuden päättelymoottori",
    "sec2.g1.title": "Inhimillisen valvonnan kehykset",
    "sec2.g1.i1": "Aktiivinen seurantanäkymä nimetylle vakuutusarvioinnin esimiehelle aukioloaikoina.",
    "sec2.g1.i2": "Manuaalinen ohitusoikeus jokaisesta kattavuussuosituksesta — ei automaattista sitomista.",
    "sec2.g1.i3": "Pakollinen kahden henkilön tarkastus riskiraja-arvon ylittäville suosituksille.",
    "sec2.g2.title": "Elinkaaren lokitus & dokumentaatio",
    "sec2.g2.i1": "Jokaisen mallikutsun automaattinen suorituslokitus muuttumattomilla, aikaleimatuilla tapahtumalokeilla.",
    "sec2.g2.i2": "Datalineagen kartoitus välittäjäsyötteestä piirteenpoiminnan kautta mallin ulostuloon.",
    "sec2.g2.i3": "Versioitu tekninen dokumentaatio synkronoituna jokaisen mallin julkaisukandidaatin kanssa.",
    "sec2.g2.i4": "Säilytyskäytäntö 19 artiklan mukaisesti — vähintään kuusi kuukautta, konfiguroitavissa vuokralaiskohtaisesti.",
    "sec2.g3.title": "Vastuullisuus & roolien selkeys",
    "sec2.g3.i1": "Organisaatio toimii järjestelmän Tarjoajana taustamallille ja Käyttöönottajana sisäisessä käytössä.",
    "sec2.g3.i2": "Nimetty vastuullinen johtaja kirjattu tekoälyjärjestelmän rekisteriin.",
    "sec2.g3.i3": "Häiriötilannekäsikirja julkaistu ja harjoiteltu neljännesvuosittain riskikomitean kanssa.",
    "tag.fact": "Ladattu asiakirjafakta",
    "tag.interpretation": "Tulkinta",

    "sec3.kicker": "Osa 03 · Riskirajat",
    "sec3.title": "Luottavaisten oletusten estot",
    "sec3.subtitle": "Syntetisoitu oletus- ja puuttuvan tiedon tarkistajien toimesta.",
    "sec3.uncertainty.title": "Epävarmuusmerkinnät",
    "sec3.uncertainty.open": "avointa",
    "sec3.u1": "Riskikuvausenkooderin koulutusdatan alkuperä on osittain dokumentoimatta (kolmannen osapuolen hienosäätö).",
    "sec3.u2": "Autonomisen päätöksenteon mittakaava arvioijan ohitusrajan yläpuolella on vahvistamatta.",
    "sec3.u3": "Rajat ylittävien hakijoiden vinoumatestauksen tuloksia ei ole toimitettu arviointiprosessille.",
    "sec3.u4": "Upotusmallin alikäsittelijälistaa ei ole varmistettu EU:n datasijaintivaatimusten osalta.",
    "sec3.actions.title": "Avoimet toimenpiteet",
    "sec3.a1": "Pyydä allekirjoitettu data-alkuperätodistus mallin toimittajalta.",
    "sec3.a2": "Hanki 12 kuukauden otos ohitusasteen telemetriasta autonomian pisteytyksen kalibroimiseksi.",
    "sec3.a3": "Varmista, tarjotaanko järjestelmää ulkoisille vakuuttajille (muuttaa Tarjoaja/Käyttöönottaja-asemaa).",
    "sec3.a4": "Tee perusoikeusvaikutusten arviointi, joka kattaa suojellun luokan välimuuttujat.",
    "sec3.a5": "Selkeytä hylättyjen hakemusten säilytysajat vakuutuselinkaaren ulkopuolella.",

    "dock.kicker": "Raportin jakelutoiminnot",
    "dock.pdf": "Vie asiakirjaraportti (PDF)",
    "dock.ppt": "Vie esittelydiat (PPT)",
    "dock.email.placeholder": "Syötä sidosryhmän sähköpostiosoite (esim. compliance@yritys.fi)...",
    "dock.send": "Lähetä raporttipaketti",
    "dock.sending": "Lähetetään raportteja taustaputkien kautta...",
    "dock.toast.pdf": "Valmistellaan PDF-vientiä…",
    "dock.toast.ppt": "Valmistellaan esittelydioja…",
    "dock.toast.invalid": "Syötä kelvollinen sähköpostiosoite.",
    "dock.toast.success": "Vaatimustenmukaisuusartefaktit lähetetty vastaanottajalle.",

    "footer.label": "Neuvoa-antava huomautus:",
    "footer.text":
      "Tämä käyttöliittymä esittää autonomisen päätöksentuen arvion tarkastelun helpottamiseksi. Se ei muodosta sitovaa oikeudellista neuvontaa eikä virallista sääntelysertifiointia.",
  },
  SV: {
    "meta.kicker": "EU:s AI-förordning · Efterlevnadsgranskning",
    "header.product": "Norrin Ipsum",
    "header.status": "Analysfas: Slutförd",
    "header.generated": "Genererad",
    "header.theme.toLight": "Växla till ljust läge",
    "header.theme.toDark": "Växla till mörkt läge",
    "header.language": "Språk",

    "sec1.kicker": "Avsnitt 01 — Humaniserad sammanfattning av användningsfall",
    "sec1.agent": "Indatatolkningsagent",
    "sec1.body.before": "Systemet är en",
    "sec1.body.highlight": "AI-assisterad försäkringskopilot",
    "sec1.body.after":
      "som triagerar inkommande kommersiella försäkringsansökningar, syntetiserar riskberättelser från ostrukturerade mäklarinlagor och rekommenderar täckningsnivåer till licensierade försäkringsbedömare.",
    "sec1.core.title": "Kärnsyfte",
    "sec1.core.body":
      "Påskynda riskbedömning i första steget och lyfta fram täckningsavvikelser för bedömarens godkännande.",
    "sec1.users.title": "Slutanvändare",
    "sec1.users.body":
      "Interna kommersiella försäkringsbedömare och seniora riskchefer hos en europeisk medelstor försäkringsgivare.",
    "sec1.deploy.title": "Driftsättningsram",
    "sec1.deploy.body":
      "Privat moln-SaaS, EU-dataresidens, integrerad med försäkringsbolagets policyadministrationssystem via signerat API.",
    "sec1.tag.sector": "Laddat dokumentfaktum · Sektor: Försäkring",
    "sec1.tag.eu": "Laddat dokumentfaktum · EU-driftsättning",
    "sec1.tag.annex": "Tolkning · Kandidat för högrisk Bilaga III",
    "sec1.tag.autonomy": "Lucka · Autonomitak ej verifierat",

    "sec2.kicker": "Avsnitt 02",
    "sec2.title": "Härledda styrningsobservationer",
    "sec2.agent": "Resonemangsmotor för efterlevnad",
    "sec2.g1.title": "Ramverk för mänsklig tillsyn",
    "sec2.g1.i1": "Aktiv övervakningspanel för en namngiven försäkringschef under kontorstid.",
    "sec2.g1.i2": "Manuell åsidosättning av varje täckningsrekommendation — ingen automatisk bindning av policyer.",
    "sec2.g1.i3": "Obligatorisk granskning av två personer för rekommendationer över en konfigurerbar riskgräns.",
    "sec2.g2.title": "Livscykelloggning & dokumentation",
    "sec2.g2.i1": "Automatisk exekveringsspårning av varje modellanrop med oföränderliga, tidsstämplade händelseloggar.",
    "sec2.g2.i2": "Datalineage-kartläggning från mäklarinlaga genom funktionsextraktion till modellutdata.",
    "sec2.g2.i3": "Versionshanterad teknisk dokumentation synkroniserad med varje modellsläppkandidat.",
    "sec2.g2.i4": "Retentionspolicy enligt artikel 19 — minst sex månader, konfigurerbar per kund.",
    "sec2.g3.title": "Ansvar & rolltydlighet",
    "sec2.g3.i1": "Organisationen agerar som systemets Leverantör för den underliggande modellen och som Driftsättare i intern utrullning.",
    "sec2.g3.i2": "Namngiven ansvarig chef registrerad i AI-systemregistret.",
    "sec2.g3.i3": "Incidenthanteringsbok publicerad och övad kvartalsvis med riskkommittén.",
    "tag.fact": "Laddat dokumentfaktum",
    "tag.interpretation": "Tolkning",

    "sec3.kicker": "Avsnitt 03 · Riskgränser",
    "sec3.title": "Förhindrande av övertro",
    "sec3.subtitle": "Syntetiserad av antagande- och saknad-informationskontrollerna.",
    "sec3.uncertainty.title": "Osäkerhetsflaggor",
    "sec3.uncertainty.open": "öppna",
    "sec3.u1": "Träningsdatats ursprung för riskberättelsekodaren är delvis odokumenterat (tredjepartsfinjustering).",
    "sec3.u2": "Operativ omfattning av autonomt beslutsfattande över bedömarens åsidosättningströskel är ej verifierad.",
    "sec3.u3": "Resultat av partiskhetstest för gränsöverskridande sökande har inte tillhandahållits.",
    "sec3.u4": "Underprocessorlista för inbäddningsmodellen har inte bekräftats mot EU-dataresidenskrav.",
    "sec3.actions.title": "Öppna åtgärder",
    "sec3.a1": "Begär signerat data-ursprungsintyg från modellens uppströmsleverantör.",
    "sec3.a2": "Hämta 12-månaders urval av åsidosättningstelemetri för att kalibrera autonomipoäng.",
    "sec3.a3": "Bekräfta om systemet erbjuds externa försäkringsbolag (ändrar Leverantörs-/Driftsättarroll).",
    "sec3.a4": "Utför en grundläggande rättighetskonsekvensbedömning som täcker proxyvariabler för skyddade klasser.",
    "sec3.a5": "Förtydliga retentionstider för avvisade ansökningar bortom policylivscykeln.",

    "dock.kicker": "Rapportdistributionsåtgärder",
    "dock.pdf": "Exportera dokumentrapport (PDF)",
    "dock.ppt": "Exportera briefingdäck (PPT)",
    "dock.email.placeholder": "Ange intressentens e-postadress (t.ex. compliance@foretag.se)...",
    "dock.send": "Skicka rapportpaket",
    "dock.sending": "Skickar rapporter via backend-pipelines...",
    "dock.toast.pdf": "Förbereder PDF-export…",
    "dock.toast.ppt": "Förbereder briefingdäck…",
    "dock.toast.invalid": "Ange en giltig e-postadress.",
    "dock.toast.success": "Efterlevnadsartefakter har skickats till mottagaren.",

    "footer.label": "Rådgivande anmärkning:",
    "footer.text":
      "Detta gränssnitt visar en autonom beslutsstödsbedömning för att underlätta granskning. Det utgör inte bindande juridisk rådgivning eller officiell regulatorisk certifiering.",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("EN");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored && ["EN", "FI", "SV"].includes(stored)) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (key: string) => dictionaries[lang][key] ?? dictionaries.EN[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}