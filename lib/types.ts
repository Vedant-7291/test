export type LeadStatus =
  | "new"
  | "contacted"
  | "demo-booked"
  | "enrolled"
  | "lost";

export type LeadSource = "chatbot" | "sample";

export type Lead = {
  id: string;
  phone: string;
  name: string;
  enquiryFor: string;
  grade: string;
  board: string;
  subjects: string;
  goal: string;
  mode: string;
  timing: string;
  challenge: string;
  demo: string;
  status: LeadStatus;
  source: LeadSource;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatbotSession = {
  phone: string;
  step: number;
  answers: Record<string, string>;
  done: boolean;
  updatedAt: number;
};
