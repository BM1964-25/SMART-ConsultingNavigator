"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Printer,
  Save,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { consultingModules, getModuleById } from "@/lib/modules";
import type {
  ActionItem,
  Answer,
  DocumentRequest,
  ExportSummary,
  Priority,
  Question,
  Risk,
  Session,
  StepStatus,
} from "@/types/consulting";

const STORAGE_KEY = "smart-consulting-navigator.sessions.v1";

const priorityLabels: Record<Priority, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
  critical: "Kritisch",
};

const priorityClasses: Record<Priority, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-sky-200 bg-sky-50 text-sky-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  critical: "border-red-200 bg-red-50 text-red-700",
};

const statusLabels: Record<StepStatus, string> = {
  open: "Offen",
  partial: "Teilweise",
  complete: "Abgeschlossen",
  critical: "Kritisch",
};

const statusClasses: Record<StepStatus, string> = {
  open: "border-slate-200 bg-white text-slate-600",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  critical: "border-red-200 bg-red-50 text-red-700",
};

const nowIso = () => new Date().toISOString();

const createSession = (moduleId = consultingModules[0].id): Session => {
  const module = getModuleById(moduleId);
  return {
    id: crypto.randomUUID(),
    moduleId,
    title: `Neue Beratung - ${module.shortTitle}`,
    client: { name: "", contact: "", company: "" },
    project: { name: "", location: "", phase: "" },
    answers: {},
    risks: [],
    actionItems: [],
    documentRequests: [
      {
        id: crypto.randomUUID(),
        title: "Bestehende Projekt- und Prozessunterlagen",
        reason: "Grundlage für die erste Einordnung und Angebotsabgrenzung.",
        status: "needed",
        source: "auto",
      },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
};

const answerToText = (answer?: Answer) => {
  if (!answer) return "";
  if (Array.isArray(answer.value)) return answer.value.join(", ");
  return String(answer.value);
};

const getStepStatus = (session: Session, stepId: string): StepStatus => {
  const module = getModuleById(session.moduleId);
  const step = module.steps.find((item) => item.id === stepId);
  if (!step) return "open";

  const required = step.questions.filter((question) => question.required);
  const requiredAnswered = required.filter((question) => answerToText(session.answers[question.id]).trim().length > 0);
  const answered = step.questions.filter((question) => answerToText(session.answers[question.id]).trim().length > 0);
  const hasCritical = step.questions.some((question) => {
    const value = answerToText(session.answers[question.id]).toLowerCase();
    return value.includes("rot") || value.includes("kritisch");
  });

  if (hasCritical) return "critical";
  if (required.length > 0 && requiredAnswered.length === required.length) return "complete";
  if (answered.length > 0) return "partial";
  return "open";
};

const getProgress = (session: Session) => {
  const module = getModuleById(session.moduleId);
  const complete = module.steps.filter((step) => getStepStatus(session, step.id) === "complete").length;
  return Math.round((complete / module.steps.length) * 100);
};

const extractLines = (value: string) =>
  value
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);

const buildSummary = (session: Session): ExportSummary => {
  const module = getModuleById(session.moduleId);
  const answers = Object.values(session.answers).map((answer) => answerToText(answer)).filter(Boolean);
  const importantAnswers = answers.slice(0, 8);
  const openQuestions = module.steps.flatMap((step) =>
    step.questions
      .filter((question) => question.required && !answerToText(session.answers[question.id]).trim())
      .map((question) => question.label),
  );
  const documentAnswers = Object.entries(session.answers)
    .filter(([key]) => key.includes("doc") || key.includes("materials") || key.includes("evidence"))
    .flatMap(([, answer]) => extractLines(answerToText(answer)));

  return {
    clientProfile: [session.client.company, session.client.name, session.project.name, session.project.phase]
      .filter(Boolean)
      .join(" | ") || "Noch nicht vollständig erfasst",
    conversationReason: answerToText(session.answers["why-now"]) || answerToText(session.answers["trigger"]) || answerToText(session.answers["audit-why"]) || answerToText(session.answers["consulting-reason"]) || "Noch offen",
    objective: answerToText(session.answers["goal"]) || answerToText(session.answers["problem"]) || "Zielsetzung im Gespräch weiter schärfen",
    insights: importantAnswers.length ? importantAnswers : ["Erkenntnisse werden aus den beantworteten Pflicht- und Vertiefungsfragen aufgebaut."],
    openPoints: openQuestions.slice(0, 10),
    criticalRisks: session.risks.filter((risk) => risk.priority === "critical" || risk.color === "red"),
    documents: [
      ...session.documentRequests,
      ...documentAnswers.map((title) => ({
        id: `auto-${title}`,
        title,
        reason: "Aus den dokumentierten Antworten abgeleitet.",
        status: "needed" as const,
        source: "auto" as const,
      })),
    ],
    immediateActions: session.actionItems.filter((item) => item.priority === "critical" || item.priority === "high"),
    actionPlan: session.actionItems,
    nextSteps: extractLines(answerToText(session.answers["next-steps"]) || answerToText(session.answers["decision"]) || answerToText(session.answers["48h"])).slice(0, 6),
    offerBasis: answerToText(session.answers["scope"]) || answerToText(session.answers["commercial-frame"]) || answerToText(session.answers["mvp-scope"]) || "Leistungsumfang, Aufwand und Zeitplan nach Unterlagensichtung konkretisieren.",
  };
};

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [view, setView] = useState<"dashboard" | "conversation" | "export">("dashboard");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Session[];
      setSessions(parsed);
      setActiveSessionId(parsed[0]?.id ?? "");
      return;
    }
    const initial = createSession();
    setSessions([initial]);
    setActiveSessionId(initial.id);
  }, []);

  useEffect(() => {
    if (sessions.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const activeModule = activeSession ? getModuleById(activeSession.moduleId) : consultingModules[0];
  const activeStep = activeModule.steps[activeStepIndex] ?? activeModule.steps[0];
  const summary = activeSession ? buildSummary(activeSession) : null;

  const metrics = useMemo(() => {
    const risks = sessions.flatMap((session) => session.risks);
    const actions = sessions.flatMap((session) => session.actionItems);
    return {
      active: sessions.length,
      openActions: actions.filter((item) => item.status !== "done").length,
      criticalRisks: risks.filter((risk) => risk.priority === "critical" || risk.color === "red").length,
      recent: [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4),
    };
  }, [sessions]);

  const updateSession = (updater: (session: Session) => Session) => {
    setSessions((current) =>
      current.map((session) => (session.id === activeSession.id ? { ...updater(session), updatedAt: nowIso() } : session)),
    );
  };

  const setAnswer = (question: Question, value: string | string[] | number) => {
    updateSession((session) => ({
      ...session,
      answers: {
        ...session.answers,
        [question.id]: {
          questionId: question.id,
          value,
          note: session.answers[question.id]?.note ?? "",
          updatedAt: nowIso(),
        },
      },
    }));
  };

  const setAnswerNote = (question: Question, note: string) => {
    updateSession((session) => ({
      ...session,
      answers: {
        ...session.answers,
        [question.id]: {
          questionId: question.id,
          value: session.answers[question.id]?.value ?? "",
          note,
          updatedAt: nowIso(),
        },
      },
    }));
  };

  const startSession = (moduleId: string) => {
    const session = createSession(moduleId);
    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
    setActiveStepIndex(0);
    setView("conversation");
  };

  if (!activeSession || !summary) {
    return <div className="p-8 text-sm text-muted">Lade Arbeitsbereich...</div>;
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="no-print hidden w-72 shrink-0 border-r border-line bg-white/90 px-5 py-6 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white shadow-soft">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">SMART Consulting</p>
              <p className="text-xs text-muted">Navigator</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavButton active={view === "dashboard"} icon={<LayoutDashboard size={17} />} label="Dashboard" onClick={() => setView("dashboard")} />
            <NavButton active={view === "conversation"} icon={<ClipboardList size={17} />} label="Gesprächsmodus" onClick={() => setView("conversation")} />
            <NavButton active={view === "export"} icon={<FileText size={17} />} label="Export-Ansicht" onClick={() => setView("export")} />
          </nav>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Beratungsmodule</p>
            <div className="space-y-2">
              {consultingModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => startSession(module.id)}
                  className="w-full rounded-lg border border-line bg-white p-3 text-left transition hover:border-accent/50 hover:shadow-soft"
                >
                  <p className="text-sm font-semibold text-ink">{module.shortTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{module.domain}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Header
            session={activeSession}
            moduleTitle={activeModule.title}
            progress={getProgress(activeSession)}
            onStart={() => startSession(activeModule.id)}
            onExport={() => setView("export")}
          />

          {view === "dashboard" && (
            <Dashboard
              metrics={metrics}
              sessions={sessions}
              onSelect={(id) => {
                setActiveSessionId(id);
                setView("conversation");
              }}
              onStart={startSession}
            />
          )}

          {view === "conversation" && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-5">
                <ClientProjectPanel session={activeSession} updateSession={updateSession} />
                <div className="rounded-lg border border-line bg-white shadow-soft">
                  <div className="border-b border-line p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-accent">{activeModule.domain}</p>
                        <h1 className="mt-1 text-2xl font-semibold text-ink">{activeStep.title}</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{activeStep.orientation}</p>
                      </div>
                      <Badge status={getStepStatus(activeSession, activeStep.id)} />
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    {activeStep.questions.map((question) => (
                      <QuestionField
                        key={question.id}
                        question={question}
                        answer={activeSession.answers[question.id]}
                        onChange={(value) => setAnswer(question, value)}
                        onNote={(note) => setAnswerNote(question, note)}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-5">
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
                      className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
                    >
                      Zurück
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setView("export")}
                        className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel"
                      >
                        <FileText size={16} /> Zusammenfassung
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStepIndex(Math.min(activeModule.steps.length - 1, activeStepIndex + 1))}
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-[#416CEC]"
                      >
                        Nächster Schritt <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <StepList moduleSteps={activeModule.steps} session={activeSession} activeStepIndex={activeStepIndex} onSelect={setActiveStepIndex} />
                <RiskPanel session={activeSession} updateSession={updateSession} />
                <DocumentPanel session={activeSession} updateSession={updateSession} />
                <ActionPanel session={activeSession} updateSession={updateSession} />
              </aside>
            </div>
          )}

          {view === "export" && <ExportView session={activeSession} summary={summary} />}
        </section>
      </div>
    </main>
  );
}

function Header({
  session,
  moduleTitle,
  progress,
  onStart,
  onExport,
}: {
  session: Session;
  moduleTitle: string;
  progress: number;
  onStart: () => void;
  onExport: () => void;
}) {
  return (
    <header className="no-print mb-5 rounded-lg border border-line bg-white px-5 py-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">SMART Consulting Navigator</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">{moduleTitle}</h1>
          <p className="mt-1 text-sm text-muted">{session.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onExport} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-panel">
            <Printer size={16} /> Export
          </button>
          <button onClick={onStart} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-[#416CEC]">
            <Plus size={16} /> Neue Sitzung
          </button>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-panel">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
        active ? "bg-accent text-white shadow-soft" : "text-slate-600 hover:bg-panel hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Dashboard({
  metrics,
  sessions,
  onSelect,
  onStart,
}: {
  metrics: { active: number; openActions: number; criticalRisks: number; recent: Session[] };
  sessions: Session[];
  onSelect: (id: string) => void;
  onStart: (moduleId: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<FolderOpen size={18} />} label="Aktive Sitzungen" value={metrics.active} />
        <Metric icon={<CalendarDays size={18} />} label="Zuletzt bearbeitet" value={metrics.recent.length} />
        <Metric icon={<CheckCircle2 size={18} />} label="Offene Maßnahmen" value={metrics.openActions} />
        <Metric icon={<ShieldAlert size={18} />} label="Kritische Risiken" value={metrics.criticalRisks} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Zuletzt bearbeitete Gespräche</h2>
            <span className="text-sm text-muted">{sessions.length} lokal gespeichert</span>
          </div>
          <div className="space-y-3">
            {sessions.map((session) => (
              <button key={session.id} onClick={() => onSelect(session.id)} className="w-full rounded-lg border border-line p-4 text-left transition hover:border-accent/50 hover:bg-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{session.client.company || session.title}</p>
                    <p className="mt-1 text-sm text-muted">{getModuleById(session.moduleId).title}</p>
                  </div>
                  <span className="text-sm font-semibold text-accent">{getProgress(session)}%</span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Moduleinstieg</h2>
          <div className="mt-4 space-y-3">
            {consultingModules.map((module) => (
              <button key={module.id} onClick={() => onStart(module.id)} className="w-full rounded-lg border border-line p-4 text-left transition hover:border-accent/50 hover:shadow-soft">
                <p className="font-semibold text-ink">{module.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-panel p-2 text-accent">{icon}</span>
        <span className="text-2xl font-semibold text-ink">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

function ClientProjectPanel({ session, updateSession }: { session: Session; updateSession: (updater: (session: Session) => Session) => void }) {
  const update = (field: "client" | "project", key: string, value: string) => {
    updateSession((current) => ({ ...current, [field]: { ...current[field], [key]: value } }));
  };
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput label="Kunde / Unternehmen" value={session.client.company} onChange={(value) => update("client", "company", value)} />
        <TextInput label="Ansprechpartner" value={session.client.name} onChange={(value) => update("client", "name", value)} />
        <TextInput label="Kontakt" value={session.client.contact} onChange={(value) => update("client", "contact", value)} />
        <TextInput label="Projekt" value={session.project.name} onChange={(value) => update("project", "name", value)} />
        <TextInput label="Standort" value={session.project.location} onChange={(value) => update("project", "location", value)} />
        <TextInput label="Phase" value={session.project.phase} onChange={(value) => update("project", "phase", value)} />
      </div>
    </section>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10" />
    </label>
  );
}

function QuestionField({ question, answer, onChange, onNote }: { question: Question; answer?: Answer; onChange: (value: string | string[] | number) => void; onNote: (note: string) => void }) {
  const value = answer?.value ?? "";
  return (
    <div className="rounded-lg border border-line bg-panel/60 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-ink">{question.label}</label>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${question.required ? "border-accent/20 bg-accent/10 text-accent" : "border-slate-200 bg-white text-muted"}`}>
          {question.required ? "Pflichtfrage" : "Optional"}
        </span>
      </div>
      {question.type === "textarea" && <textarea value={String(value)} onChange={(event) => onChange(event.target.value)} rows={4} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10" />}
      {question.type === "text" && <input value={String(value)} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10" />}
      {question.type === "date" && <input type="date" value={String(value)} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10" />}
      {(question.type === "select" || question.type === "traffic-light") && (
        <select value={String(value)} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10">
          <option value="">Bitte auswählen</option>
          {question.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      )}
      {question.type === "multi-select" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options?.map((option) => {
            const selected = Array.isArray(value) && value.includes(option);
            return (
              <label key={option} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${selected ? "border-accent bg-accent/10 text-accent" : "border-line bg-white text-ink"}`}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(event) => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(event.target.checked ? [...current, option] : current.filter((item) => item !== option));
                  }}
                />
                {option}
              </label>
            );
          })}
        </div>
      )}
      {question.type === "scale" && (
        <div className="flex items-center gap-4">
          <input type="range" min="1" max="10" value={Number(value) || 5} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#527DF6]" />
          <span className="w-10 rounded-lg border border-line bg-white py-2 text-center text-sm font-semibold">{Number(value) || 5}</span>
        </div>
      )}
      <input value={answer?.note ?? ""} onChange={(event) => onNote(event.target.value)} placeholder="Optionale Notiz zur Antwort" className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10" />
    </div>
  );
}

function StepList({ moduleSteps, session, activeStepIndex, onSelect }: { moduleSteps: { id: string; title: string }[]; session: Session; activeStepIndex: number; onSelect: (index: number) => void }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <h2 className="mb-3 text-sm font-semibold text-ink">Schritte</h2>
      <div className="space-y-2">
        {moduleSteps.map((step, index) => {
          const status = getStepStatus(session, step.id);
          return (
            <button key={step.id} onClick={() => onSelect(index)} className={`w-full rounded-lg border p-3 text-left text-sm transition ${index === activeStepIndex ? "border-accent bg-accent/10" : "border-line hover:bg-panel"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink">{index + 1}. {step.title}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses[status]}`}>{statusLabels[status]}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Badge({ status }: { status: StepStatus }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}>{statusLabels[status]}</span>;
}

function RiskPanel({ session, updateSession }: { session: Session; updateSession: (updater: (session: Session) => Session) => void }) {
  const addRisk = () => updateSession((current) => ({
    ...current,
    risks: [...current.risks, { id: crypto.randomUUID(), title: "Neues Risiko", probability: 3, impact: 3, priority: "medium", color: "yellow", mitigation: "" }],
  }));
  return (
    <SidePanel title="Risiken" icon={<AlertTriangle size={17} />} onAdd={addRisk}>
      {session.risks.map((risk) => (
        <div key={risk.id} className="rounded-lg border border-line bg-white p-3">
          <input value={risk.title} onChange={(event) => updateSession((current) => ({ ...current, risks: current.risks.map((item) => item.id === risk.id ? { ...item, title: event.target.value } : item) }))} className="w-full border-0 bg-transparent text-sm font-semibold outline-none" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={risk.priority} onChange={(event) => updateSession((current) => ({ ...current, risks: current.risks.map((item) => item.id === risk.id ? { ...item, priority: event.target.value as Priority } : item) }))} className="rounded-lg border border-line px-2 py-2 text-sm">
              {Object.entries(priorityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select value={risk.color} onChange={(event) => updateSession((current) => ({ ...current, risks: current.risks.map((item) => item.id === risk.id ? { ...item, color: event.target.value as Risk["color"] } : item) }))} className="rounded-lg border border-line px-2 py-2 text-sm">
              <option value="green">Grün</option>
              <option value="yellow">Gelb</option>
              <option value="red">Rot</option>
            </select>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
            <label>Eintritt <input type="range" min="1" max="5" value={risk.probability} onChange={(event) => updateSession((current) => ({ ...current, risks: current.risks.map((item) => item.id === risk.id ? { ...item, probability: Number(event.target.value) } : item) }))} className="w-full accent-[#527DF6]" /></label>
            <label>Auswirkung <input type="range" min="1" max="5" value={risk.impact} onChange={(event) => updateSession((current) => ({ ...current, risks: current.risks.map((item) => item.id === risk.id ? { ...item, impact: Number(event.target.value) } : item) }))} className="w-full accent-[#527DF6]" /></label>
          </div>
        </div>
      ))}
    </SidePanel>
  );
}

function DocumentPanel({ session, updateSession }: { session: Session; updateSession: (updater: (session: Session) => Session) => void }) {
  const addDocument = () => updateSession((current) => ({
    ...current,
    documentRequests: [...current.documentRequests, { id: crypto.randomUUID(), title: "Neue Unterlage", reason: "Manuell ergänzt", status: "needed", source: "manual" }],
  }));
  return (
    <SidePanel title="Unterlagen" icon={<FileText size={17} />} onAdd={addDocument}>
      {session.documentRequests.map((doc) => (
        <div key={doc.id} className="rounded-lg border border-line bg-white p-3">
          <input value={doc.title} onChange={(event) => updateSession((current) => ({ ...current, documentRequests: current.documentRequests.map((item) => item.id === doc.id ? { ...item, title: event.target.value } : item) }))} className="w-full border-0 bg-transparent text-sm font-semibold outline-none" />
          <p className="mt-1 text-xs text-muted">{doc.source === "auto" ? "Automatisch abgeleitet" : "Manuell ergänzt"}</p>
          <select value={doc.status} onChange={(event) => updateSession((current) => ({ ...current, documentRequests: current.documentRequests.map((item) => item.id === doc.id ? { ...item, status: event.target.value as DocumentRequest["status"] } : item) }))} className="mt-3 w-full rounded-lg border border-line px-2 py-2 text-sm">
            <option value="needed">Benötigt</option>
            <option value="requested">Angefordert</option>
            <option value="received">Erhalten</option>
          </select>
        </div>
      ))}
    </SidePanel>
  );
}

function ActionPanel({ session, updateSession }: { session: Session; updateSession: (updater: (session: Session) => Session) => void }) {
  const addAction = () => updateSession((current) => ({
    ...current,
    actionItems: [...current.actionItems, { id: crypto.randomUUID(), title: "Neue Maßnahme", description: "", priority: "medium", owner: "", dueDate: "", status: "open" }],
  }));
  return (
    <SidePanel title="Maßnahmen" icon={<Target size={17} />} onAdd={addAction}>
      {session.actionItems.map((action) => (
        <div key={action.id} className="rounded-lg border border-line bg-white p-3">
          <input value={action.title} onChange={(event) => updateSession((current) => ({ ...current, actionItems: current.actionItems.map((item) => item.id === action.id ? { ...item, title: event.target.value } : item) }))} className="w-full border-0 bg-transparent text-sm font-semibold outline-none" />
          <textarea value={action.description} onChange={(event) => updateSession((current) => ({ ...current, actionItems: current.actionItems.map((item) => item.id === action.id ? { ...item, description: event.target.value } : item) }))} placeholder="Beschreibung" rows={2} className="mt-2 w-full rounded-lg border border-line px-2 py-2 text-sm outline-none" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input value={action.owner} onChange={(event) => updateSession((current) => ({ ...current, actionItems: current.actionItems.map((item) => item.id === action.id ? { ...item, owner: event.target.value } : item) }))} placeholder="Verantwortlich" className="rounded-lg border border-line px-2 py-2 text-sm" />
            <input type="date" value={action.dueDate} onChange={(event) => updateSession((current) => ({ ...current, actionItems: current.actionItems.map((item) => item.id === action.id ? { ...item, dueDate: event.target.value } : item) }))} className="rounded-lg border border-line px-2 py-2 text-sm" />
            <select value={action.priority} onChange={(event) => updateSession((current) => ({ ...current, actionItems: current.actionItems.map((item) => item.id === action.id ? { ...item, priority: event.target.value as Priority } : item) }))} className="rounded-lg border border-line px-2 py-2 text-sm">
              {Object.entries(priorityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select value={action.status} onChange={(event) => updateSession((current) => ({ ...current, actionItems: current.actionItems.map((item) => item.id === action.id ? { ...item, status: event.target.value as ActionItem["status"] } : item) }))} className="rounded-lg border border-line px-2 py-2 text-sm">
              <option value="open">Offen</option>
              <option value="in-progress">In Arbeit</option>
              <option value="done">Erledigt</option>
            </select>
          </div>
        </div>
      ))}
    </SidePanel>
  );
}

function SidePanel({ title, icon, children, onAdd }: { title: string; icon: React.ReactNode; children: React.ReactNode; onAdd: () => void }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">{icon}{title}</h2>
        <button onClick={onAdd} className="rounded-lg border border-line bg-white p-2 text-accent hover:bg-accent hover:text-white" aria-label={`${title} ergänzen`}>
          <Plus size={15} />
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ExportView({ session, summary }: { session: Session; summary: ExportSummary }) {
  const module = getModuleById(session.moduleId);
  return (
    <section className="print-area rounded-lg border border-line bg-white p-6 shadow-soft">
      <div className="no-print mb-5 flex justify-end">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft">
          <Printer size={16} /> Druckansicht öffnen
        </button>
      </div>
      <div className="border-b border-line pb-5">
        <p className="text-sm font-semibold text-accent">SMART Consulting Navigator</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Gesprächsgrundlage und Ergebnisprotokoll</h1>
        <p className="mt-2 text-sm text-muted">{module.title}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ExportBlock title="Kurzprofil des Kunden und Projekts" items={[summary.clientProfile]} />
        <ExportBlock title="Gesprächsanlass" items={[summary.conversationReason]} />
        <ExportBlock title="Zielsetzung" items={[summary.objective]} />
        <ExportBlock title="Grundlage für ein Angebot" items={[summary.offerBasis]} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ExportBlock title="Zentrale Erkenntnisse" items={summary.insights} />
        <ExportBlock title="Offene Punkte" items={summary.openPoints.length ? summary.openPoints : ["Keine offenen Pflichtfragen erkennbar."]} />
        <ExportBlock title="Kritische Risiken" items={summary.criticalRisks.length ? summary.criticalRisks.map((risk) => `${risk.title} (${priorityLabels[risk.priority]})`) : ["Keine kritischen Risiken dokumentiert."]} />
        <ExportBlock title="Benötigte Unterlagen" items={summary.documents.map((doc) => `${doc.title} - ${doc.status}`)} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ExportBlock title="Empfohlene Sofortmaßnahmen" items={summary.immediateActions.length ? summary.immediateActions.map((item) => item.title) : ["Sofortmaßnahmen im Gespräch weiter konkretisieren."]} />
        <ExportBlock title="Vorschlag für nächste Schritte" items={summary.nextSteps.length ? summary.nextSteps : ["Unterlagen sichten, Scope bestätigen, Angebot vorbereiten."]} />
      </div>
      <div className="mt-4 rounded-lg border border-line p-4">
        <h2 className="mb-3 text-lg font-semibold text-ink">Maßnahmenplan</h2>
        <div className="grid gap-3">
          {summary.actionPlan.length ? summary.actionPlan.map((item) => (
            <div key={item.id} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">{item.title}</p>
                <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${priorityClasses[item.priority]}`}>{priorityLabels[item.priority]}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{item.description || "Beschreibung offen"} | {item.owner || "Verantwortung offen"} | {item.dueDate || "Frist offen"}</p>
            </div>
          )) : <p className="text-sm text-muted">Noch keine Maßnahmen dokumentiert.</p>}
        </div>
      </div>
    </section>
  );
}

function ExportBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <h2 className="mb-3 text-base font-semibold text-ink">{title}</h2>
      <ul className="space-y-2 text-sm leading-6 text-muted">
        {items.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}
      </ul>
    </div>
  );
}
