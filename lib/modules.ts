import type { ConsultingModule, ConsultingStep, Question } from "@/types/consulting";

const q = (id: string, label: string, type: Question["type"] = "textarea", required = false, options?: string[]): Question => ({
  id,
  label,
  type,
  required,
  options,
});

const step = (id: string, title: string, orientation: string, questions: Question[]): ConsultingStep => ({
  id,
  title,
  orientation,
  questions,
});

export const consultingModules: ConsultingModule[] = [
  {
    id: "ai-app-development",
    title: "KI-App-Entwicklung und digitale Prozesse",
    shortTitle: "KI & Prozesse",
    domain: "Digitale Transformation",
    description:
      "Strukturierte Aufnahme eines Kundenbedarfs für individuelle KI-Apps, Automatisierung und digitale Prozesslösungen.",
    steps: [
      step("reason", "Anlass und Ziel klären", "Der Einstieg schärft das eigentliche Beratungsmandat und die Entscheidung, die vorbereitet werden soll.", [
        q("why-now", "Warum beschäftigen Sie sich aktuell mit einer App oder KI-Lösung?", "textarea", true),
        q("problem", "Welches konkrete Problem soll gelöst werden?", "textarea", true),
        q("next-decision", "Welche Entscheidung wird als nächstes benötigt?", "textarea"),
      ]),
      step("current-process", "Heutigen Prozess verstehen", "Hier entsteht ein belastbares Bild der realen Arbeitsweise statt nur der Soll-Vorstellung.", [
        q("process-today", "Wie läuft der Prozess heute ab?", "textarea", true),
        q("repeat-steps", "Welche Arbeitsschritte wiederholen sich regelmäßig?", "textarea"),
        q("media-breaks", "Wo entstehen Medienbrüche?", "traffic-light", false, ["Keine", "Teilweise", "Kritisch"]),
      ]),
      step("pain-points", "Problem und Pain Points erfassen", "Pain Points zeigen, wo eine digitale Lösung wirtschaftlich und organisatorisch wirken kann.", [
        q("duplicate-info", "Welche Informationen werden mehrfach erfasst?", "textarea"),
        q("bottlenecks", "Welche Engpässe oder Fehlerquellen sind sichtbar?", "textarea", true),
        q("severity", "Wie stark ist der aktuelle Leidensdruck?", "scale", true),
      ]),
      step("users", "Nutzergruppen und Rollen definieren", "Rollen und Akzeptanz entscheiden früh darüber, ob ein MVP nutzbar und einführbar ist.", [
        q("current-users", "Wer nutzt den Prozess heute?", "textarea", true),
        q("future-users", "Wer soll die spätere Lösung verwenden?", "textarea", true),
        q("roles", "Welche Rollen, Rechte oder Freigaben werden benötigt?", "textarea"),
      ]),
      step("data", "Datenlage und Dokumente prüfen", "Die Datenlage bestimmt Aufwand, Automatisierungsgrad und Risiken der späteren Umsetzung.", [
        q("documents", "Welche Dokumente, Tabellen oder Systeme werden aktuell genutzt?", "textarea", true),
        q("structured-data", "Welche Daten liegen strukturiert vor?", "textarea"),
        q("unstructured-data", "Welche Daten liegen unstrukturiert vor?", "textarea"),
      ]),
      step("features", "Gewünschte Funktionen erfassen", "Funktionen werden nach Muss, Später und Nice-to-have getrennt, damit der MVP realistisch bleibt.", [
        q("must-have", "Welche Funktionen wären zwingend erforderlich?", "textarea", true),
        q("later", "Welche Funktionen wären später sinnvoll?", "textarea"),
        q("integration", "Welche Schnittstellen oder Systeme müssten angebunden werden?", "textarea"),
      ]),
      step("risks", "Risiken, Datenschutz und Grenzen bewerten", "Datenschutz, Vertraulichkeit und Akzeptanz müssen früh sichtbar werden.", [
        q("privacy", "Welche Risiken bestehen hinsichtlich Datenschutz, Vertraulichkeit oder Akzeptanz?", "textarea", true),
        q("limits", "Welche Grenzen darf die Lösung nicht überschreiten?", "textarea"),
        q("risk-level", "Wie kritisch ist die Gesamtrisikolage?", "traffic-light", true, ["Grün", "Gelb", "Rot"]),
      ]),
      step("value", "Nutzen und Wirtschaftlichkeit einschätzen", "Messbare Effekte helfen, Budget und Priorität nachvollziehbar zu begründen.", [
        q("success", "Was wäre ein messbarer Erfolg?", "textarea", true),
        q("savings", "Welche Zeit- oder Kosteneinsparung wäre realistisch?", "textarea"),
        q("business-value", "Wie hoch ist der erwartete Nutzen?", "scale"),
      ]),
      step("mvp", "MVP und Ausbauphasen definieren", "Ein klarer MVP reduziert Risiko und schafft eine konkrete Angebotsgrundlage.", [
        q("mvp-scope", "Was soll ein erster MVP leisten?", "textarea", true),
        q("phase-two", "Welche Ausbauphasen sind sinnvoll?", "textarea"),
        q("timeline", "Welcher Zieltermin ist realistisch?", "date"),
      ]),
      step("offer", "Nächste Schritte und Angebotsgrundlage erstellen", "Zum Abschluss werden Entscheidung, Unterlagen und Angebotslogik geordnet.", [
        q("decision", "Welche Entscheidung muss jetzt vorbereitet werden?", "textarea", true),
        q("materials-needed", "Welche Unterlagen werden für ein Angebot benötigt?", "textarea"),
        q("commercial-frame", "Welche Budget- oder Rahmenbedingungen sind bekannt?", "textarea"),
      ]),
    ],
  },
  {
    id: "construction-crisis",
    title: "Troubleshooting und Krisenbewältigung bei Bauprojekten",
    shortTitle: "Krise & Bau",
    domain: "Bauprojektsteuerung",
    description:
      "Analyse kritischer Bauprojekte mit Kosten-, Termin-, Qualitäts-, Vertrags- oder Konfliktproblemen.",
    steps: [
      step("crisis-picture", "Krisenbild aufnehmen", "Ein gemeinsames Lagebild trennt Symptome von unmittelbar entscheidungsrelevanten Punkten.", [
        q("trigger", "Was ist der konkrete Auslöser der aktuellen Situation?", "textarea", true),
        q("since", "Seit wann besteht das Problem?", "text"),
        q("impact", "Welche Auswirkungen bestehen auf Kosten, Termine und Qualität?", "textarea", true),
      ]),
      step("escalation", "Auslöser und Eskalationsgrad klären", "Der Eskalationsgrad bestimmt Taktung, Beteiligte und Kommunikationsbedarf.", [
        q("urgent-decisions", "Welche Entscheidungen sind dringend erforderlich?", "textarea", true),
        q("parties", "Welche Parteien sind beteiligt?", "textarea"),
        q("conflicts", "Gibt es offene oder verdeckte Konflikte?", "traffic-light", false, ["Nein", "Möglich", "Ja"]),
      ]),
      step("costs", "Kostenstatus prüfen", "Kostenabweichungen und Nachträge müssen getrennt und priorisiert betrachtet werden.", [
        q("cost-status", "Wie ist der aktuelle Kostenstand?", "textarea", true),
        q("budget-gap", "Welche Budgetabweichungen bestehen?", "textarea"),
        q("claims", "Welche Nachträge liegen vor oder sind angekündigt?", "textarea"),
      ]),
      step("schedule", "Terminstatus prüfen", "Termine werden anhand kritischer Meilensteine und realer Abhängigkeiten bewertet.", [
        q("schedule-status", "Wie ist der aktuelle Terminstand?", "textarea", true),
        q("milestones", "Welche kritischen Meilensteine sind gefährdet?", "textarea"),
        q("delay-risk", "Wie kritisch ist der Terminverzug?", "traffic-light", true, ["Grün", "Gelb", "Rot"]),
      ]),
      step("quality", "Qualitäts- und Mängelsituation erfassen", "Qualitätsthemen werden nach technischer Relevanz, Dokumentation und Folgeeffekten sortiert.", [
        q("defects", "Welche Qualitätsprobleme oder Mängel bestehen?", "textarea", true),
        q("evidence", "Welche Unterlagen liegen vor?", "textarea"),
        q("gaps", "Welche Dokumentationslücken bestehen?", "textarea"),
      ]),
      step("contracts", "Vertrags- und Nachtragssituation prüfen", "Verträge, Nachträge und Verantwortlichkeiten setzen den Rahmen für belastbare Maßnahmen.", [
        q("contract-issues", "Welche vertraglichen Themen sind offen?", "textarea"),
        q("change-orders", "Welche Nachträge sind strittig?", "textarea"),
        q("responsibility", "Sind Verantwortlichkeiten klar geregelt?", "traffic-light", false, ["Ja", "Teilweise", "Nein"]),
      ]),
      step("stakeholders", "Stakeholder und Konflikte analysieren", "Konflikte werden sichtbar gemacht, ohne vorschnell Schuldfragen zu priorisieren.", [
        q("stakeholders", "Welche Stakeholder beeinflussen die Lösung?", "textarea", true),
        q("blocked-decisions", "Welche Entscheidungen sind blockiert?", "textarea"),
        q("communication", "Wie funktioniert die aktuelle Kommunikation?", "traffic-light", false, ["Gut", "Angespannt", "Kritisch"]),
      ]),
      step("causes", "Ursachen eingrenzen", "Die Ursache wird nach Planung, Ausführung, Vergabe, Steuerung, Kommunikation und Organisation eingegrenzt.", [
        q("cause-area", "Liegt die Ursache eher in Planung, Ausführung, Vergabe, Steuerung, Kommunikation oder Organisation?", "multi-select", true, ["Planung", "Ausführung", "Vergabe", "Steuerung", "Kommunikation", "Organisation"]),
        q("evidence-cause", "Welche Hinweise stützen diese Einschätzung?", "textarea"),
      ]),
      step("immediate", "Sofortmaßnahmen ableiten", "Die nächsten 48 Stunden sollen Risiko reduzieren und Entscheidungsfähigkeit herstellen.", [
        q("48h", "Was muss innerhalb der nächsten 48 Stunden geklärt werden?", "textarea", true),
        q("limit-risks", "Welche Risiken müssen sofort begrenzt werden?", "textarea", true),
        q("quick-actions", "Welche Maßnahmen sind kurzfristig umsetzbar?", "textarea"),
      ]),
      step("recovery", "Sanierungsfahrplan erstellen", "Der Fahrplan verbindet kurzfristige Stabilisierung mit klarer Fortschrittskontrolle.", [
        q("monitoring", "Wie soll der Fortschritt überwacht werden?", "textarea", true),
        q("roadmap", "Welche Schritte braucht der Sanierungsfahrplan?", "textarea"),
        q("owner", "Wer verantwortet die Umsetzung?", "text"),
      ]),
    ],
  },
  {
    id: "construction-audit",
    title: "Baurevision",
    shortTitle: "Baurevision",
    domain: "Revision & Prüfung",
    description: "Vorbereitung und Durchführung einer Baurevision für Projekte, Organisationen oder Leistungsbereiche.",
    steps: [
      step("audit-reason", "Prüfungsanlass klären", "Der Anlass grenzt Verdacht, Prävention und nachträgliche Aufarbeitung voneinander ab.", [
        q("audit-why", "Warum soll eine Baurevision durchgeführt werden?", "textarea", true),
        q("red-flags", "Gibt es konkrete Verdachtsmomente oder Auffälligkeiten?", "textarea"),
      ]),
      step("audit-goal", "Prüfungsziel definieren", "Ein klares Ziel verhindert eine zu breite oder nicht entscheidungsfähige Prüfung.", [
        q("audit-mode", "Soll präventiv, begleitend oder nachträglich geprüft werden?", "select", true, ["Präventiv", "Begleitend", "Nachträglich"]),
        q("report-form", "In welcher Form soll der Revisionsbericht erstellt werden?", "textarea"),
      ]),
      step("phase", "Projektphase erfassen", "Die Projektphase bestimmt verfügbare Unterlagen, Risiken und Prüftiefe.", [
        q("project-phase", "Welche Projektphase ist betroffen?", "select", true, ["Planung", "Vergabe", "Ausführung", "Abnahme", "Betrieb", "Nachlauf"]),
        q("participants", "Welche Projektbeteiligten sollen einbezogen werden?", "textarea"),
      ]),
      step("scope", "Prüfungsumfang festlegen", "Der Umfang fokussiert die Revision auf relevante Leistungsbereiche und Prüffelder.", [
        q("areas", "Welche Leistungsbereiche sollen geprüft werden?", "textarea", true),
        q("topics", "Geht es um Kosten, Termine, Verträge, Qualität, Organisation oder Dokumentation?", "multi-select", true, ["Kosten", "Termine", "Verträge", "Qualität", "Organisation", "Dokumentation"]),
      ]),
      step("documents", "Unterlagenbedarf bestimmen", "Dokumente werden nach bereits vorhanden, fehlend und kritisch für die Prüfung sortiert.", [
        q("docs-available", "Welche Unterlagen liegen bereits vor?", "textarea"),
        q("docs-missing", "Welche Unterlagen fehlen?", "textarea", true),
      ]),
      step("audit-check", "Kosten, Termine, Qualität und Verträge prüfen", "Die Kernfelder werden systematisch auf Abweichungen und Plausibilität geprüft.", [
        q("deviations", "Gibt es Nachträge, Terminverzug oder Budgetabweichungen?", "textarea", true),
        q("responsibilities", "Sind Verantwortlichkeiten klar geregelt?", "traffic-light", false, ["Ja", "Teilweise", "Nein"]),
      ]),
      step("findings", "Feststellungen dokumentieren", "Feststellungen werden belegbar und trennscharf dokumentiert.", [
        q("deep-dive", "Welche Feststellungen sollen besonders vertieft werden?", "textarea", true),
        q("evidence", "Welche Belege liegen dafür vor?", "textarea"),
      ]),
      step("risk-rating", "Risiken bewerten", "Risiken werden nach Kritikalität und Handlungsbedarf geordnet.", [
        q("critical-risks", "Welche Risiken sind kritisch?", "textarea", true),
        q("risk-score", "Wie hoch ist die Gesamtkritikalität?", "scale", true),
      ]),
      step("recommendations", "Empfehlungen ableiten", "Empfehlungen müssen prüfbar, priorisiert und anschlussfähig sein.", [
        q("recommendations", "Welche Handlungsempfehlungen ergeben sich?", "textarea", true),
        q("quick-wins", "Welche Empfehlungen sind kurzfristig umsetzbar?", "textarea"),
      ]),
      step("report", "Revisionsbericht vorbereiten", "Zum Abschluss werden Bericht, offene Punkte und nächste Abstimmung vorbereitet.", [
        q("report-structure", "Welche Berichtsgliederung ist sinnvoll?", "textarea"),
        q("next-alignment", "Welche Abstimmung ist als nächstes erforderlich?", "textarea", true),
      ]),
    ],
  },
  {
    id: "strategic-project-analysis",
    title: "Projektanalyse und strategische Beratung",
    shortTitle: "Projektanalyse",
    domain: "Strategie & Steuerung",
    description: "Analyse von Bau- und Immobilienprojekten, Organisationsstrukturen, Prozessen und Steuerungssystemen.",
    steps: [
      step("situation", "Ausgangslage erfassen", "Die Ausgangslage beschreibt Anlass, Kontext und sichtbare Spannungsfelder.", [
        q("consulting-reason", "Was ist der Anlass der Beratung?", "textarea", true),
        q("decision", "Welche Entscheidung soll vorbereitet werden?", "textarea"),
      ]),
      step("goal", "Beratungsziel definieren", "Das Ziel macht den späteren Nutzen und die Abgrenzung des Mandats sichtbar.", [
        q("goal", "Welches Ziel soll erreicht werden?", "textarea", true),
        q("success-criteria", "Woran wird der Beratungserfolg gemessen?", "textarea"),
      ]),
      step("structure", "Projekt- oder Organisationsstruktur verstehen", "Strukturen zeigen, wo Steuerung, Verantwortung und Informationsfluss zusammenkommen.", [
        q("structure", "Wie ist das Projekt oder die Organisation aufgebaut?", "textarea", true),
        q("interfaces", "Welche Schnittstellen sind kritisch?", "textarea"),
      ]),
      step("roles", "Rollen und Verantwortlichkeiten analysieren", "Unklare Verantwortung ist häufig ein zentraler Hebel für Verbesserungen.", [
        q("roles", "Welche Rollen und Verantwortlichkeiten bestehen?", "textarea", true),
        q("unclear", "Wo gibt es unklare Zuständigkeiten?", "textarea"),
      ]),
      step("processes", "Prozesse und Schnittstellen prüfen", "Prozesse werden nach Stabilität, Reibung und Wirkung auf Entscheidungen beurteilt.", [
        q("working", "Welche Prozesse funktionieren gut?", "textarea"),
        q("problems", "Welche Prozesse verursachen Probleme?", "textarea", true),
      ]),
      step("controls", "Steuerungsinstrumente bewerten", "Reports, Kennzahlen und Routinen werden auf Entscheidungsnutzen geprüft.", [
        q("instruments", "Welche Steuerungsinstrumente werden genutzt?", "textarea"),
        q("dashboards", "Welche Reports, Kennzahlen oder Dashboards bestehen?", "textarea"),
      ]),
      step("weaknesses", "Risiken und Schwachstellen erfassen", "Risiken und Schwachstellen werden priorisiert statt nur gesammelt.", [
        q("visible-risks", "Welche Risiken sind aktuell sichtbar?", "textarea", true),
        q("weakness-level", "Wie kritisch sind die Schwachstellen?", "traffic-light", true, ["Grün", "Gelb", "Rot"]),
      ]),
      step("quick-wins", "Quick Wins identifizieren", "Kurzfristige Wirksamkeit schafft Momentum für strukturelle Verbesserungen.", [
        q("short-actions", "Welche Maßnahmen wären kurzfristig wirksam?", "textarea", true),
        q("effort", "Wie hoch ist der Umsetzungsaufwand?", "scale"),
      ]),
      step("roadmap", "Roadmap ableiten", "Die Roadmap verbindet Quick Wins mit mittelfristiger Organisations- oder Projektentwicklung.", [
        q("medium-changes", "Welche strukturellen Änderungen sind mittelfristig erforderlich?", "textarea", true),
        q("roadmap", "Welche Arbeitspakete gehören in die Roadmap?", "textarea"),
      ]),
      step("offer", "Angebotsgrundlage erstellen", "Die Angebotsgrundlage konkretisiert Scope, Nutzen, Aufwand und nächste Schritte.", [
        q("next-steps", "Welche nächsten Schritte sollen vereinbart werden?", "textarea", true),
        q("scope", "Welcher Leistungsumfang ist für ein Angebot plausibel?", "textarea"),
      ]),
    ],
  },
];

export const getModuleById = (id: string) => consultingModules.find((module) => module.id === id) ?? consultingModules[0];
