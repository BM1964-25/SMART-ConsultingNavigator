export type QuestionType = "text" | "textarea" | "select" | "multi-select" | "scale" | "traffic-light" | "date";
export type StepStatus = "open" | "partial" | "complete" | "critical";
export type Priority = "low" | "medium" | "high" | "critical";
export type TrafficLight = "green" | "yellow" | "red";

export type ConsultingModule = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  domain: string;
  steps: ConsultingStep[];
};

export type ConsultingStep = {
  id: string;
  title: string;
  orientation: string;
  questions: Question[];
};

export type Question = {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export type Answer = {
  questionId: string;
  value: string | string[] | number;
  note?: string;
  updatedAt: string;
};

export type Risk = {
  id: string;
  title: string;
  probability: number;
  impact: number;
  priority: Priority;
  color: TrafficLight;
  mitigation?: string;
};

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  owner: string;
  dueDate: string;
  status: "open" | "in-progress" | "done";
};

export type DocumentRequest = {
  id: string;
  title: string;
  reason: string;
  status: "needed" | "requested" | "received";
  source: "auto" | "manual";
};

export type Client = {
  name: string;
  contact: string;
  company: string;
};

export type Project = {
  name: string;
  location: string;
  phase: string;
};

export type Session = {
  id: string;
  moduleId: string;
  title: string;
  client: Client;
  project: Project;
  answers: Record<string, Answer>;
  risks: Risk[];
  actionItems: ActionItem[];
  documentRequests: DocumentRequest[];
  createdAt: string;
  updatedAt: string;
};

export type ExportSummary = {
  clientProfile: string;
  conversationReason: string;
  objective: string;
  insights: string[];
  openPoints: string[];
  criticalRisks: Risk[];
  documents: DocumentRequest[];
  immediateActions: ActionItem[];
  actionPlan: ActionItem[];
  nextSteps: string[];
  offerBasis: string;
};
